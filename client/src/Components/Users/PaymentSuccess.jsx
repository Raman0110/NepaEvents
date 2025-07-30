import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaUsers,
} from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";

export const PaymentSuccess = () => {
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  useEffect(() => {
    const bookingId = localStorage.getItem("bookingId")
    async function fetchPaymentDetail() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/venue-bookings/${bookingId}`
        );
        setPaymentDetail(response.data.booking);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch booking details.");
      } finally {
        setLoading(false);
      }
    }
    async function verifyPayment() {
      try {
        await axios.get(`http://localhost:3000/api/venue-bookings/verify-payment/${bookingId}?session_id=${sessionId}`);
        console.log("Booking successful receipt sent to email");
      } catch (error) {
        console.log(error)
      }
    }
    fetchPaymentDetail();
    verifyPayment();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading payment details...</p>
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
                Your venue booking has been confirmed
              </p>
            </div>
          </div>

          <div className="px-8 pb-8 -mt-6">
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <span className="w-8 h-8 rounded-full bg-[#ED4A43] bg-opacity-10 mr-3 flex items-center justify-center">
                  <FaBuilding className="text-[#ED4A43]" />
                </span>
                Booking Details
              </h3>

              {paymentDetail ? (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Booking Id:
                      </span>
                      <span className="text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {paymentDetail._id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Venue:</span>
                      <span className="text-gray-800 font-semibold">
                        {paymentDetail.venue?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium flex items-center">
                        <FaCalendarAlt className="text-[#ED4A43] mr-2" />
                        Date:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {paymentDetail.eventDetails?.date}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium flex items-center">
                        <FaMapMarkerAlt className="text-[#ED4A43] mr-2" />
                        Location:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {paymentDetail.venue?.location}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium flex items-center">
                        <FaUsers className="text-[#ED4A43] mr-2" />
                        Capacity:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {paymentDetail.venue?.capacity} people
                      </span>
                    </div>

                    <div className="mt-2 pt-4 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-800 font-bold">
                        Total Amount:
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-[#ED4A43]">
                          Rs. {paymentDetail.venue?.price?.toFixed(2)}
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
                  No payment details available.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Link
                to="/mybookings"
                className="py-3.5 bg-[#ED4A43] text-white font-semibold rounded-lg shadow-md hover:shadow-lg flex items-center justify-center"
              >
                My Bookings
              </Link>

              <Link
                to="/"
                className="py-3.5 bg-white border-2 border-[#ED4A43] text-[#ED4A43] font-semibold rounded-lg shadow-sm hover:shadow-md flex items-center justify-center"
              >
                Browse Venues
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
