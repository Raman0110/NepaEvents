import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUser, FaTicketAlt, FaBuilding, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const AdminPayment = () => {
  const [payments, setPayments] = useState({ tickets: [], venueBookings: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ticket'); // 'ticket' or 'venue'

  useEffect(() => {
    fetchPayments();
  }, []);

  // Function to consolidate tickets from the same user for the same event
  const consolidateTickets = (tickets) => {
    const ticketMap = new Map();

    // Group tickets by user and event
    tickets.forEach(ticket => {
      if (!ticket) return;

      const key = `${ticket.userId}-${ticket.eventId}`;
      if (!ticketMap.has(key)) {
        ticketMap.set(key, {
          ...ticket,
          ticketCount: ticket.ticketCount || 1,
          // Calculate proper amount based on price * quantity
          amount: (ticket.price || 0) * (ticket.ticketCount || 1),
          totalQRCodes: 1 // Count of actual QR codes received
        });
      } else {
        const existingTicket = ticketMap.get(key);
        existingTicket.ticketCount += (ticket.ticketCount || 1);
        // Recalculate amount using price * total quantity
        existingTicket.amount = (ticket.price || 0) * existingTicket.ticketCount;
        existingTicket.totalQRCodes += 1; // Increment QR code count
        // Keep the most recent date
        if (new Date(ticket.date) > new Date(existingTicket.date)) {
          existingTicket.date = ticket.date;
        }
      }
    });

    return Array.from(ticketMap.values());
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Fetch ticket data from the payments endpoint
      const ticketsResponse = await axios.get("http://localhost:3000/api/payments", {
        withCredentials: true
      });


      // Fetch venue bookings data'
      const venueBookingsResponse = await axios.get("http://localhost:3000/api/venue-bookings", {
        withCredentials: true
      });


      // Format venue booking data - handle different possible response structures
      let formattedVenueBookings = [];

      if (venueBookingsResponse.data) {
        // If data is an array
        if (Array.isArray(venueBookingsResponse.data)) {
          formattedVenueBookings = venueBookingsResponse.data
            .filter(booking => booking && booking.paymentStatus === "paid")
            .map(booking => ({
              _id: booking._id,
              type: 'venue',
              venueId: booking.venue?._id,
              venueName: booking.venue?.name,
              userId: booking.organizer?._id,
              userName: booking.organizer?.fullName,
              amount: booking.venue?.price || 0,
              date: booking.requestedAt,
              transactionId: `VB-${booking._id.toString().substring(0, 8)}`
            }));
        }
        // If data has a bookings property that is an array
        else if (venueBookingsResponse.data.bookings && Array.isArray(venueBookingsResponse.data.bookings)) {
          formattedVenueBookings = venueBookingsResponse.data.bookings
            .filter(booking => booking && booking.paymentStatus === "paid")
            .map(booking => ({
              _id: booking._id,
              type: 'venue',
              venueId: booking.venue?._id,
              venueName: booking.venue?.name,
              userId: booking.organizer?._id,
              userName: booking.organizer?.fullName,
              amount: booking.venue?.price || 0,
              date: booking.requestedAt,
              transactionId: `VB-${booking._id.toString().substring(0, 8)}`
            }));
        }
      }

      // Process ticket data - make sure ticket data is filtered properly
      let ticketData = [];
      if (Array.isArray(ticketsResponse.data)) {
        ticketData = ticketsResponse.data
          .filter(payment => payment && payment.type === 'event')
          .map(ticket => ({
            ...ticket,
            // Store the original price per ticket
            price: ticket.amount / (ticket.ticketCount || 1),
            // Ensure ticketCount is at least 1 since the system sometimes doesn't save the correct quantity
            ticketCount: ticket.ticketCount || 1
          }));

        // Consolidate tickets by user and event to show the total count
        ticketData = consolidateTickets(ticketData);
      }

      // Set combined data
      setPayments({
        tickets: ticketData,
        venueBookings: formattedVenueBookings
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errorMessage = error?.response?.data?.message || "Failed to fetch payment data.";
      toast.error(errorMessage);
      console.error("Error fetching payments:", error);

      // Fallback to admin revenue data
      try {
        const fallbackResponse = await axios.get("http://localhost:3000/api/admin/payment-revenue", {
          withCredentials: true
        });


        // Process event revenue data
        const eventPayments = [];
        const venuePayments = [];

        // Add venue payments from admin revenue
        if (fallbackResponse.data && fallbackResponse.data.venueRevenue &&
          fallbackResponse.data.venueRevenue.venues &&
          Array.isArray(fallbackResponse.data.venueRevenue.venues)) {
          fallbackResponse.data.venueRevenue.venues.forEach(venue => {
            if (venue && venue._id) {
              venuePayments.push({
                _id: venue._id,
                type: 'venue',
                venueId: venue._id,
                venueName: venue.name || 'Unknown Venue',
                userId: venue.owner?._id || 'Unknown',
                userName: venue.owner?.fullName || 'Unknown User',
                amount: venue.totalRevenue || 0,
                date: venue.updatedAt || new Date(),
                transactionId: `V-${venue._id.toString().substring(0, 8)}`
              });
            }
          });
        }

        setPayments({
          tickets: eventPayments,
          venueBookings: venuePayments
        });

        setLoading(false);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  };

  // Get the appropriate data for the current tab
  const ticketPayments = payments.tickets;
  const venuePayments = payments.venueBookings;

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 font-sans">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:30px_30px] pointer-events-none" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payment Management</h1>
        <p className="text-gray-600 mt-2">View and manage all payment transactions</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          <button
            className={`px-4 md:px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'ticket'
              ? 'border-b-2 border-[#ED4A43] text-[#ED4A43]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('ticket')}
          >
            <FaTicketAlt />
            <span>Ticket Payments</span>
          </button>
          <button
            className={`px-4 md:px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'venue'
              ? 'border-b-2 border-[#ED4A43] text-[#ED4A43]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('venue')}
          >
            <FaBuilding />
            <span>Venue Bookings</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ED4A43]"></div>
        </div>
      )}

      {/* Ticket Payments Table */}
      {!loading && activeTab === 'ticket' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaTicketAlt className="text-[#ED4A43]" />
              <span>Ticket Buyers</span>
            </h2>
            <p className="text-gray-600 mt-1">List of users who have purchased event tickets</p>
          </div>

          {ticketPayments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No ticket payments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Codes
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ticketPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.userName || 'Unknown User'}</div>
                            <div className="text-xs md:text-sm text-gray-500 truncate max-w-[120px] md:max-w-xs">{payment.userId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.eventName || 'Unknown Event'}</div>
                        <div className="text-xs md:text-sm text-gray-500">{payment.venueName || 'Unknown Venue'}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.date ? formatDate(payment.date) : 'N/A'}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.ticketCount || 0}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.totalQRCodes || 1}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#ED4A43]">${(payment.amount || 0).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          ${((payment.price || 0)).toFixed(2)} × {payment.ticketCount}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Venue Booking Payments Table */}
      {!loading && activeTab === 'venue' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaBuilding className="text-blue-500" />
              <span>Venue Bookings</span>
            </h2>
            <p className="text-gray-600 mt-1">List of venue bookings and payments</p>
          </div>

          {venuePayments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No venue booking payments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked By
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {venuePayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.venueName || 'Unknown Venue'}</div>
                        <div className="text-xs md:text-sm text-gray-500 truncate max-w-[120px] md:max-w-xs">{payment.venueId || 'N/A'}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.userName || 'Unknown User'}</div>
                            <div className="text-xs md:text-sm text-gray-500 truncate max-w-[120px] md:max-w-xs">{payment.userId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.date ? formatDate(payment.date) : 'N/A'}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-500">${(payment.amount || 0).toFixed(2)}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.transactionId || 'N/A'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-8">
        {/* Ticket Sales Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Ticket Sales</h3>
            <div className="p-2 bg-[#ED4A43]/10 rounded-full">
              <FaTicketAlt className="text-lg md:text-xl text-[#ED4A43]" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                ${ticketPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tickets Sold</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {ticketPayments.reduce((sum, payment) => sum + (payment.ticketCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Venue Booking Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Venue Bookings</h3>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <FaBuilding className="text-lg md:text-xl text-blue-500" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                ${venuePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {venuePayments.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayment; 