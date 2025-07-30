import React, { useEffect } from 'react';
import { 
  FaTimesCircle, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaHome, 
  FaRedo, 
  FaQuestionCircle,
  FaMusic,
  FaTicketAlt
} from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';

export const EventPaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const errorCode = searchParams.get('error_code') || 'payment_failed';
  
  const bookingDetails = {
    bookingNumber: 'EB-20250412-7834',
    eventName: 'Summer Music Festival',
    ticketType: 'VIP Pass',
    quantity: 2,
    date: 'May 20, 2025',
    location: 'Tundikhel, Kathmandu',
    ticketPrice: 1500,
    totalAmount: 3000
  };
  
  const errorMessages = {
    payment_failed: 'Your payment could not be processed. Please check your payment details and try again.',
    card_declined: 'Your card was declined. Please try with a different payment method.',
    insufficient_funds: 'The payment failed due to insufficient funds. Please try with a different payment method.',
    expired_card: 'The payment failed because the card has expired. Please update your card details or try a different payment method.',
    processing_error: 'A processing error occurred. Please try again later or contact customer support.',
    network_error: 'A network error occurred during payment processing. Please check your internet connection and try again.'
  };
  
  const errorMessage = errorMessages[errorCode] || errorMessages.payment_failed;
  
  useEffect(() => {
    // If you have a session ID, log it
    if (sessionId) {
      console.log('Session ID:', sessionId);
      console.log('Error Code:', errorCode);
    } else {
      console.log('No session ID provided');
    }
  }, [sessionId, errorCode]);

  return (
    <div className="bg-gray-50 py-12 px-4 md:px-12 lg:px-20 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Failure Card with enhanced visual appeal */}
        <div className="bg-white rounded-xl overflow-hidden shadow-xl transform transition-all animate-fadeIn">
          {/* Enhanced header with wave shape */}
          <div className="relative bg-gray-700 pt-12 pb-16 text-center">
            <div className="relative z-10">
              <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-5 shadow-lg border-4 border-white">
                <FaTimesCircle className="text-red-600 text-5xl" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
              <p className="text-white text-opacity-90 text-lg">Your event ticket payment was not completed</p>
            </div>
            
            {/* Wave shape at bottom of header */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
                <path 
                  fill="#ffffff" 
                  fillOpacity="1" 
                  d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                ></path>
              </svg>
            </div>
          </div>

          {/* Booking Details with improved layout */}
          <div className="px-8 pb-8 -mt-6">
            {/* Error Message Box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <FaTimesCircle className="text-red-600 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">
                {errorMessage}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <span className="inline-block w-8 h-8 rounded-full bg-gray-700 bg-opacity-10 mr-3 flex items-center justify-center">
                  <FaMusic className="text-gray-700" />
                </span>
                Booking Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Booking Number:</span>
                  <span className="text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded-full text-sm">{bookingDetails.bookingNumber}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Event:</span>
                  <span className="text-gray-800 font-semibold">{bookingDetails.eventName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaTicketAlt className="text-gray-700 mr-2" />
                    Ticket Type:
                  </span>
                  <span className="text-gray-800 font-semibold">{bookingDetails.ticketType}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Quantity:</span>
                  <span className="text-gray-800 font-semibold">{bookingDetails.quantity}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaCalendarAlt className="text-gray-700 mr-2" />
                    Date:
                  </span>
                  <span className="text-gray-800 font-semibold">{bookingDetails.date}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FaMapMarkerAlt className="text-gray-700 mr-2" />
                    Location:
                  </span>
                  <span className="text-gray-800 font-semibold">{bookingDetails.location}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Ticket Price:</span>
                  <span className="text-gray-800 font-semibold">Rs. {bookingDetails.ticketPrice.toFixed(2)} each</span>
                </div>
                
                <div className="mt-2 pt-4 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <span className="text-gray-800 font-bold">Total Amount:</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-gray-700">Rs. {bookingDetails.totalAmount.toFixed(2)}</span>
                    <span className="text-xs text-red-600 font-medium">Payment Failed</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons with enhanced design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Link 
                to="/event-payment" 
                className="py-3.5 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
              >
                <FaRedo className="mr-2" />
                Try Again
              </Link>
              
              <Link 
                to="/events" 
                className="py-3.5 bg-white border-2 border-gray-700 text-gray-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
              >
                <FaHome className="mr-2" />
                Browse Events
              </Link>
            </div>
            
            <button
              className="w-full py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              <FaQuestionCircle className="mr-2" />
              Contact Support
            </button>
          </div>
        </div>
        
        {/* Additional message */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>We apologize for the inconvenience. If you continue to experience issues, please contact our support team.</p>
          {sessionId && <p className="mt-2">Session ID: {sessionId}</p>}
          {errorCode && <p>Error Code: {errorCode}</p>}
        </div>
      </div>
    </div>
  );
};

export default EventPaymentFailure;