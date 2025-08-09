import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMusic,
  FaUsers,
} from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";

export const EventPaymentSuccess = () => {
  const [eventDetail, setEventDetail] = useState(null);
  const [purchaseDetails, setPurchaseDetails] = useState({
    quantity: 1,
    totalAmount: 0,
    discountApplied: false,
    discountPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const eventId = localStorage.getItem("eventId");
    async function fetchEventDetail() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/event/${eventId}`,
          { withCredentials: true }
        );
        setEventDetail(response.data.event);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch event details.");
      }
    }

    async function verifyPayment() {
      try {
        // First verify the payment
        const verifyResponse = await axios.get(
          `http://localhost:3000/api/event/verify-purchase/${eventId}?session_id=${sessionId}`,
          { withCredentials: true }
        );

        if (!verifyResponse.data.success) {
          throw new Error(verifyResponse.data.message || "Payment verification failed");
        }

        // Then get the session details
        const sessionResponse = await axios.get(
          `http://localhost:3000/api/event/get-session/${sessionId}`,
          { withCredentials: true }
        );

        if (sessionResponse.data.success) {
          setPurchaseDetails({
            quantity: parseInt(sessionResponse.data.quantity) || 1,
            totalAmount: sessionResponse.data.amount_total / 100, // Convert from cents to dollars
            discountApplied: sessionResponse.data.discountApplied === "true",
            discountPercentage: parseInt(sessionResponse.data.discountPercentage) || 0
          });
        }

        console.log("Event booking successful, ticket sent to email");
      } catch (error) {
        console.error("Payment verification error:", error);
        setError("Failed to verify payment details.");
      } finally {
        setLoading(false);
      }
    }

    if (eventId && sessionId) {
      verifyPayment();
      fetchEventDetail();
    } else {
      setError("Missing event information or session ID.");
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Confirming your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 px-4 md:px-12 lg:px-20 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl overflow-hidden shadow-xl">
          <div className="relative bg-[#ED4A43] pt-12 pb-16 text-center">
            <div className="relative z-10">
              <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-5 shadow-lg border-4 border-white">
                <FaCheckCircle className="text-[#ED4A43] text-5xl" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Booking Successful!
              </h1>
              <p className="text-white text-opacity-90 text-lg">
                Your event ticket has been confirmed
              </p>
            </div>
          </div>

          <div className="px-8 pb-8 -mt-6">
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <span className="w-8 h-8 rounded-full bg-[#ED4A43] bg-opacity-10 mr-3 flex items-center justify-center">
                  <FaMusic className="text-[#ED4A43]" />
                </span>
                Event Details
              </h3>

              {eventDetail ? (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Event ID:</span>
                      <span className="text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {eventDetail._id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Event:</span>
                      <span className="text-gray-800 font-semibold">
                        {eventDetail.title}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium flex items-center">
                        <FaCalendarAlt className="text-[#ED4A43] mr-2" />
                        Date:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {new Date(eventDetail.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium flex items-center">
                        <FaMapMarkerAlt className="text-[#ED4A43] mr-2" />
                        Venue:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {eventDetail.venue?.name || eventDetail.venue}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Organizer:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {eventDetail.organizer?.fullName || eventDetail.organizer?.name || "Event Organizer"}
                      </span>
                    </div>

                    <div className="mt-2 pt-4 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-bold">
                          {purchaseDetails.quantity > 1 ?
                            `${purchaseDetails.quantity} Tickets` :
                            "Ticket Price"
                          }:
                        </span>
                        {purchaseDetails.discountApplied && (
                          <span className="text-sm text-gray-500">
                            {purchaseDetails.discountPercentage}% discount applied
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        {purchaseDetails.quantity > 1 && purchaseDetails.discountApplied && (
                          <span className="text-sm text-gray-500 line-through">
                            Rs {(eventDetail.price * purchaseDetails.quantity).toFixed(2)}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-[#ED4A43]">
                          Rs {purchaseDetails.totalAmount.toFixed(2)}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          Payment Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">
                  No event details available.
                </p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-center">
                Your ticket has been sent to your email. Please check your inbox for the e-ticket with QR code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Link
                to="/mytickets"
                className="py-3.5 bg-[#ED4A43] text-white font-semibold rounded-lg shadow-md hover:shadow-lg flex items-center justify-center"
              >
                My Tickets
              </Link>

              <Link
                to="/event"
                className="py-3.5 bg-white border-2 border-[#ED4A43] text-[#ED4A43] font-semibold rounded-lg shadow-sm hover:shadow-md flex items-center justify-center"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPaymentSuccess;