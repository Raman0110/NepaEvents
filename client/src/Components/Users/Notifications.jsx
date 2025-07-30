import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FaCheckCircle,
  FaBell,
  FaCalendarAlt,
  FaTicketAlt,
  FaBuilding,
  FaTrash,
  FaRegCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.error("Please log in to view notifications");
    }
  }, [user, navigate]);

  // Fetch notifications on component mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/notifications", {
        withCredentials: true,
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      } else {
        setError("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("An error occurred while fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update notification in state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        "http://localhost:3000/api/notifications/read-all",
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update all notifications in state
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/notifications/${notificationId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove notification from state
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Handle notification click - mark as read and navigate if needed
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type and related item
    if (notification.relatedItem) {
      const { itemId, itemType } = notification.relatedItem;
      
      if (itemType === "event") {
        // If it's a payment success notification, navigate to my tickets
        if (notification.type === "payment_success") {
          navigate('/mytickets');
        } else {
          navigate(`/event/${itemId}`);
        }
      } else if (itemType === "booking") {
        navigate(`/mybookings`);
      } else if (itemType === "ticket") {
        navigate('/mytickets');
      }
    } else if (notification.type === "payment_success") {
      // If no related item is specified but it's a payment notification, navigate to my tickets
      navigate('/mytickets');
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "venue_approval":
        return <FaBuilding className="text-green-500" />;
      case "payment_success":
        return <FaCheckCircle className="text-green-500" />;
      case "ticket_reminder":
        return <FaCalendarAlt className="text-orange-500" />;
      default:
        return <FaBell className="text-blue-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-600 hover:text-[#ED4A43] transition-colors"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">
            {notifications.filter((n) => !n.isRead).length} unread notifications
          </p>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center text-sm font-medium text-[#ED4A43] hover:text-[#D43C35] transition-colors"
            >
              <FaRegCheckCircle className="mr-2" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ED4A43]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div className="flex justify-center mb-4">
              <FaBell size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500">
              We'll notify you when there's activity on your account
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 transition-all ${
                  notification.isRead
                    ? "border-gray-200"
                    : "border-[#ED4A43]"
                }`}
              >
                <div className="flex items-start p-4">
                  {/* Icon */}
                  <div className="p-2 rounded-full bg-gray-100 mr-4">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <h3
                        className={`font-semibold ${
                          notification.isRead
                            ? "text-gray-700"
                            : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-sm ${
                        notification.isRead
                          ? "text-gray-500"
                          : "text-gray-700"
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete notification"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;