import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const fetchBooking = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    console.log('Current user ID:', user._id);

    try {
      // First try to get all bookings
      const response = await axios.get('http://localhost:3000/api/venue-bookings', { 
        withCredentials: true 
      });
      
      console.log('API Response:', response);
      
      if (!response?.data?.bookings || !Array.isArray(response?.data?.bookings)) {
        console.error('Invalid response format from API:', response?.data);
        setLoading(false);
        return;
      }
      
      console.log('All bookings from API:', response?.data?.bookings);
      
      // Filter bookings by current user
      let currentUserBooking = response?.data?.bookings?.filter(
        (booking) => booking?.organizer?._id === user?._id
      );
      
      console.log('User bookings after filtering:', currentUserBooking);
      
      // If no bookings found by user ID, check for bookingId in localStorage
      if (currentUserBooking.length === 0) {
        const storedBookingId = localStorage.getItem('bookingId');
        console.log('Checking for stored booking ID:', storedBookingId);
        
        if (storedBookingId) {
          // Try to fetch the specific booking
          try {
            const bookingResponse = await axios.get(`http://localhost:3000/api/venue-bookings/${storedBookingId}`, {
              withCredentials: true
            });
            
            if (bookingResponse?.data?.booking) {
              console.log('Found booking by stored ID:', bookingResponse.data.booking);
              currentUserBooking = [bookingResponse.data.booking];
            }
          } catch (err) {
            console.log('Error fetching booking by ID:', err);
          }
        }
      }
      
      // Check notification system for booking approvals for this user
      try {
        const notificationsResponse = await axios.get('http://localhost:3000/api/notifications', {
          withCredentials: true
        });
        
        console.log('User notifications:', notificationsResponse?.data?.notifications);
        
        // Look for venue approval notifications
        const approvalNotifications = notificationsResponse?.data?.notifications?.filter(
          notification => notification.type === 'venue_approval'
        );
        
        console.log('Approval notifications:', approvalNotifications);
        
        // If we have approval notifications, check if any of them are for bookings not in our list
        if (approvalNotifications?.length > 0) {
          for (const notification of approvalNotifications) {
            if (notification.relatedItem?.itemId && !currentUserBooking.some(booking => booking._id === notification.relatedItem.itemId)) {
              try {
                const bookingResponse = await axios.get(`http://localhost:3000/api/venue-bookings/${notification.relatedItem.itemId}`, {
                  withCredentials: true
                });
                
                if (bookingResponse?.data?.booking) {
                  console.log('Found booking from notification:', bookingResponse.data.booking);
                  currentUserBooking.push(bookingResponse.data.booking);
                }
              } catch (err) {
                console.log('Error fetching booking from notification:', err);
              }
            }
          }
        }
      } catch (err) {
        console.log('Error fetching notifications:', err);
      }
      
      if (currentUserBooking?.length === 0) {
        console.log('No bookings found for this user. Checking organizer IDs:');
        response?.data?.bookings?.forEach(booking => {
          console.log('Booking organizer ID:', booking?.organizer?._id, 'User ID:', user._id, 'Match?', booking?.organizer?._id === user?._id);
        });
      }
      
      setBookings(currentUserBooking || []);
    } catch (error) {
      console.log('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    
    // Check for payment success in URL params
    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = queryParams.get('session_id');
    const bookingId = localStorage.getItem('bookingId');
    
    if (sessionId && bookingId) {
      checkPaymentStatus(bookingId);
      // Clear the URL params after processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const handleRefresh = () => {
    fetchBooking();
  };

  const getStatusColor = (status, paymentStatus) => {
    if (status === 'approved' && paymentStatus === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    if (paymentStatus === 'paid') {
      return 'bg-green-100 text-green-800';
    }
    
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status, paymentStatus) => {
    if (paymentStatus === 'paid') {
      return '💰';
    }
    
    if (status === 'approved' && paymentStatus === 'pending') {
      return '💳';
    }
    
    switch (status) {
      case 'approved':
        return '✓';
      case 'pending':
        return '⏱';
      case 'rejected':
        return '✕';
      default:
        return '';
    }
  };

  const handleStripePayment = async (id) => {
    try {
      setCheckingPayment(prev => ({ ...prev, [id]: true }));
      const response = await axios.post(
        'http://localhost:3000/api/venue-bookings/pay', 
        { bookingId: id },
        { withCredentials: true }
      );
      
      // Store the booking ID and also extract the session ID from the URL
      localStorage.setItem('bookingId', id);
      
      // Extract session ID from Stripe URL
      const url = new URL(response.data.url);
      const sessionId = url.searchParams.get('session_id');
      if (sessionId) {
        localStorage.setItem('stripeSessionId', sessionId);
        console.log('Stored session ID:', sessionId);
      }
      
      // Open payment window
      const paymentWindow = window.open(response.data.url, '_blank');
      
      if (!paymentWindow) {
        toast.error('Popup blocked! Please allow popups for this site to complete payment.');
        return;
      }
      
      toast.success('Payment window opened. Please complete your payment.');
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Error initiating payment. Please try again or contact support.');
    } finally {
      setCheckingPayment(prev => ({ ...prev, [id]: false }));
    }
  };

  const checkPaymentStatus = async (bookingId) => {
    setCheckingPayment(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      toast.loading('Verifying payment status...');
      
      // 1. Check if we have a session ID in localStorage
      const sessionId = localStorage.getItem('stripeSessionId');
      
      if (sessionId) {
        try {
          const verifyResponse = await axios.get(
            `http://localhost:3000/api/venue-bookings/verify-payment/${bookingId}?session_id=${sessionId}`,
            { withCredentials: true }
          );
          
          if (verifyResponse.data.success) {
            // Clear the stored session ID and booking ID after successful verification
            localStorage.removeItem('stripeSessionId');
            localStorage.removeItem('bookingId');
            
            // Update the booking in our local state
            setBookings(prevBookings => 
              prevBookings.map(booking => 
                booking._id === bookingId 
                  ? { ...booking, paymentStatus: 'paid' } 
                  : booking
              )
            );
            
            toast.dismiss();
            toast.success('Payment verified successfully! Your booking is now confirmed.');
            fetchBooking(); // Refresh the bookings
            return;
          }
        } catch (err) {
          console.log('Error verifying payment with session ID:', err);
          toast.dismiss();
          toast.error(err.response?.data?.message || 'Error verifying payment');
        }
      }
      
      // 2. Check receipts for this booking
      try {
        const receiptsResponse = await axios.get(
          'http://localhost:3000/api/venue-bookings/my-receipts', 
          { withCredentials: true }
        );
        
        const matchingReceipt = receiptsResponse.data.receipts?.find(
          receipt => receipt.venue?._id === bookings.find(b => b._id === bookingId)?.venue?._id
        );
        
        if (matchingReceipt) {
          // Update booking payment status in database
          const updateResponse = await axios.post(
            `http://localhost:3000/api/venue-bookings/${bookingId}/update-payment`,
            {
              paymentStatus: 'paid',
              transactionId: matchingReceipt.transactionId
            }, 
            { withCredentials: true }
          );
          
          if (updateResponse.data.success) {
            // Update local state
            setBookings(prevBookings => 
              prevBookings.map(booking => 
                booking._id === bookingId 
                  ? { ...booking, paymentStatus: 'paid' } 
                  : booking
              )
            );
            
            toast.dismiss();
            toast.success('Payment status updated successfully!');
            fetchBooking();
            return;
          }
        }
        
        toast.dismiss();
        toast.error('No payment record found. Please complete your payment.');
      } catch (err) {
        console.log('Error checking receipts:', err);
        toast.dismiss();
        toast.error('Error checking payment status. Please try again.');
      }
    } catch (error) {
      console.log('Error checking payment status:', error);
      toast.dismiss();
      toast.error('Error checking payment status. Please try again.');
    } finally {
      setCheckingPayment(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh} 
              className="bg-[#ED4A43] text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Refresh bookings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="bg-white rounded-lg shadow px-4 py-2">
              <span className="text-sm text-gray-600 mr-2">Filter:</span>
              <select
                className="text-sm border-0 focus:ring-0"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Cancelled</option>
                <option>Payment Required</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ED4A43]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.length > 0 ? (
              bookings
                .filter(booking => {
                  if (filter === 'All') return true;
                  if (filter === 'Confirmed') return booking.status === 'approved' && booking.paymentStatus === 'paid';
                  if (filter === 'Pending') return booking.status === 'pending';
                  if (filter === 'Cancelled') return booking.status === 'rejected';
                  if (filter === 'Payment Required') return booking.status === 'approved' && booking.paymentStatus === 'pending';
                  return true;
                })
                .map((booking) => (
                <div
                  key={booking?._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className={`border-l-4 ${booking.status === 'approved' && booking.paymentStatus === 'pending' ? 'border-l-yellow-500' : booking.paymentStatus === 'paid' ? 'border-l-green-500' : 'border-l-[#ED4A43]'} p-6`}>
                    {booking.status === 'approved' && booking.paymentStatus === 'pending' && (
                      <div className="bg-yellow-50 text-yellow-800 px-4 py-2 mb-4 rounded-md flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Payment required to complete booking</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {booking?.eventDetails?.title || 'Unknown Event'}
                        </h2>
                        <div className="flex items-center text-gray-600 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {booking?.venue?.location || 'Unknown Location'}
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {booking?.eventDetails?.date ? new Date(booking.eventDetails.date).toLocaleDateString() : 'Unknown Date'}
                        </div>
                        <div className="text-gray-500 text-sm mt-1">
                          <span className="font-medium">Status:</span> {booking?.status || 'Unknown'}
                        </div>
                        <div className="text-gray-500 text-sm mt-1">
                          <span className="font-medium">Payment:</span> {booking?.paymentStatus || 'Unknown'}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(booking?.status, booking?.paymentStatus)}`}>
                        <span className="mr-1">{getStatusIcon(booking?.status, booking?.paymentStatus)}</span>
                        {booking?.paymentStatus === "paid" 
                          ? "Venue Booked" 
                          : (booking?.status === "approved" && booking?.paymentStatus === "pending") 
                            ? "Payment Required" 
                            : booking?.status || 'Unknown Status'
                        }
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      {booking?.status === 'approved' && booking?.paymentStatus === 'pending' ? (
                        <>
                          <button
                            className={`px-4 py-2 text-sm ${checkingPayment[booking._id] ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
                            onClick={() => checkPaymentStatus(booking?._id)}
                            disabled={checkingPayment[booking._id]}
                          >
                            {checkingPayment[booking._id] ? 'Checking...' : 'Check Payment Status'}
                          </button>
                          <button
                            className="px-4 py-2 text-sm bg-[#ED4A43] text-white rounded hover:bg-red-600"
                            onClick={() => handleStripePayment(booking?._id)}
                          >
                            Pay Now
                          </button>
                        </>
                      ) : null}
                      {booking?.paymentStatus === "paid" && (
                        <button
                          className="px-4 py-2 text-sm bg-[#ED4A43] text-white rounded hover:bg-red-600"
                          onClick={() => navigate(`/eventRevenue/${booking.eventDetails.title}`)}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p className="mt-4 text-gray-500 text-lg">No bookings found</p>
                <p className="mt-1 text-gray-400">Your venue bookings will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooking;