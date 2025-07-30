import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import { FaCalendarAlt, FaMapMarkerAlt, FaCreditCard, FaReceipt, FaExclamationTriangle, FaRedoAlt } from "react-icons/fa";

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch venue booking payments for the user
      const response = await axios.get("http://localhost:3000/api/venue-bookings/my-receipts", { 
        withCredentials: true 
      });
      setPayments(response.data.receipts || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setError(error.message || "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    fetchPaymentHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ED4A43] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Venue Payments</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Error Loading Payment History</h2>
            <p className="text-gray-500 mb-6">
              {error}
            </p>
            <button
              onClick={fetchPaymentHistory}
              className="inline-flex items-center px-4 py-2 bg-[#ED4A43] text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaRedoAlt className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Venue Payments</h1>

        {payments && payments.length > 0 ? (
          <div className="space-y-6">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="p-6 border-l-4 border-l-[#ED4A43]">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {payment.venue?.name || "Venue Name"}
                      </h2>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FaCalendarAlt className="text-[#ED4A43] mr-2" />
                          <span>
                            {payment.paymentDate
                              ? new Date(payment.paymentDate).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Date not available"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaMapMarkerAlt className="text-[#ED4A43] mr-2" />
                          <span>
                            {payment.venue?.location || "Location not available"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaCreditCard className="text-[#ED4A43] mr-2" />
                          <span>Transaction #{payment.transactionId?.substring(0, 8) || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium mb-2">
                        Completed
                      </span>
                      <span className="text-xl font-bold text-[#ED4A43]">
                        ${payment.amountPaid?.toFixed(2) || 0}
                      </span>
                      <span className="text-sm text-gray-500">
                        Paid via Card
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                    <button
                      onClick={() => window.open(`http://localhost:3000/api/venue-bookings/${payment._id}/download-receipt`, '_blank')}
                      className="inline-flex items-center px-4 py-2 bg-[#ED4A43] text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaReceipt className="mr-2" />
                      Download Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaReceipt className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Payment Records Found</h2>
            <p className="text-gray-500 mb-6">
              You haven't made any venue booking payments yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPayments; 