import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaDownload, FaUsers, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadError, setDownloadError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/api/ticket/user", {
          withCredentials: true
        });

        setTickets(response.data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const handleDownloadTicket = async (ticketId, index = null) => {
    try {
      setDownloadError(null);

      // Find the ticket to check if it has ticketCodes
      const ticket = tickets.find(t => t._id === ticketId);
      console.log("Ticket to download:", ticket);
      // Build the URL based on the backend implementation
      let downloadUrl = `http://localhost:3000/api/ticket/${ticketId}/download?code=${ticket.ticketCodes[0]}`;

      // Trigger the download using axios with responseType blob
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: 'blob'
      });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${ticketId}${index !== null ? `_${index + 1}` : ''}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading ticket:", error);
      setDownloadError("Failed to download ticket. Please try again later.");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    // Set the ticket to be deleted and show confirmation dialog
    setTicketToDelete(ticketId);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;

    try {
      setDeleteError(null);

      // Call the delete API endpoint
      await axios.delete(`http://localhost:3000/api/ticket/${ticketToDelete}`, {
        withCredentials: true
      });

      // Remove the deleted ticket from state
      setTickets(tickets.filter(ticket => ticket._id !== ticketToDelete));

      // Show success toast message
      toast.success("Ticket deleted successfully!");

      // Reset deletion state
      setTicketToDelete(null);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting ticket:", error);
      setDeleteError("Failed to delete ticket. Please try again later.");
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setTicketToDelete(null);
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ED4A43] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>

        {downloadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{downloadError}</p>
          </div>
        )}

        {deleteError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{deleteError}</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this ticket? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {tickets && tickets.length > 0 ? (
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="p-6 border-l-4 border-l-[#ED4A43]">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {ticket.event?.title || "Event Name"}
                      </h2>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FaCalendarAlt className="text-[#ED4A43] mr-2" />
                          <span>
                            {ticket.event?.date
                              ? new Date(ticket.event.date).toLocaleString("en-US", {
                                weekday: "long",
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
                            {ticket.event?.venue?.name || ticket.venue?.name || "Venue not specified"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaTicketAlt className="text-[#ED4A43] mr-2" />
                          <span>
                            {ticket.quantity > 1
                              ? `${ticket.quantity} Tickets`
                              : `Ticket #${ticket._id.substring(0, 8)}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                      <div className="flex items-center">
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                          Confirmed
                        </span>
                        <button
                          onClick={() => handleDeleteTicket(ticket._id)}
                          className="ml-3 p-2 bg-gray-100 text-red-500 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label="Delete ticket"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </div>
                      <div className="text-right mt-2">
                        {ticket.quantity > 1 && (
                          <span className="block text-sm text-gray-500">
                            {ticket.quantity} × Rs {ticket.price?.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xl font-bold text-[#ED4A43]">
                          Rs {(ticket.price * (ticket.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Purchased on {new Date(ticket.createdAt || ticket.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        {ticket.quantity > 1 ? 'Download Tickets:' : 'Download Ticket:'}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* //ticket */}
                      <button
                        onClick={() => handleDownloadTicket(ticket._id)}
                        className="inline-flex items-center px-3 py-1 bg-[#ED4A43] text-white text-xs font-medium rounded-md hover:bg-red-600"
                      >
                        <FaDownload className="mr-1" />
                        Download
                      </button>
                      {/* )} */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaTicketAlt className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Tickets Found</h2>
            <p className="text-gray-500 mb-6">
              You haven't purchased any event tickets yet.
            </p>
            <button
              onClick={() => navigate("/event")}
              className="inline-flex items-center px-6 py-3 bg-[#ED4A43] text-white text-base font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;