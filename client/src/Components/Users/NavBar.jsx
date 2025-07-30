import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBell, FaUserCircle, FaCog, FaHistory, FaSignOutAlt, FaEdit, FaTicketAlt, FaQrcode, FaCreditCard, FaReceipt } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import logo from "./logo.png";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();  // Removed isLoggedIn and only used user
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");
  const [notificationCount, setNotificationCount] = useState(0);
  const currentPath = window.location.pathname;

  // Update active link when location changes 
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // Fetch notification count
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get('http://localhost:3000/api/notifications', {
            withCredentials: true
          });
          
          if (response.data.success) {
            // Count unread notifications
            const unreadCount = response.data.notifications.filter(notif => !notif.isRead).length;
            setNotificationCount(unreadCount);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      
      fetchNotifications();
      
      // Set up interval to check for new notifications every 30 seconds
      const intervalId = setInterval(fetchNotifications, 30000);
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Function to check if a link is active
  const isActive = (path) => activeLink === path;

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/logout", {}, { withCredentials: true });
      localStorage.clear();
      toast.success("Logged out successfully");
      setUser(null);
      setDropdownOpen(false);
      navigate("/login");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to logout.";
      toast.error(errorMessage);
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-bold text-[#ED4A43]">NepaEvents</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-10">
            {[
              { name: "Home", path: "/" },
              { name: "Event", path: "/event" },
              { name: "Venue", path: "/bookvenue" },
              { name: "About Us", path: "/aboutus" },
              { name: "Contact Us", path: "/contactus" },
            ].map((link) => (
              <button
                key={link.name}
                className={`text-sm font-medium transition-all duration-200 relative ${isActive(link.path) ? "text-[#ED4A43] font-semibold" : "text-gray-600 hover:text-[#ED4A43]"
                  }`}
                onClick={() => navigate(link.path)}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-[#ED4A43] rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Icons & Profile */}
          <div className="flex items-center space-x-5">
            {/* Favorite and Notification Icons - Only show if user is logged in */}
            {user && (
              <>
                {/* Favorite Icon */}
                <button
                  className={`transition-colors relative ${isActive("/favourites") ? "text-[#ED4A43]" : "text-gray-500 hover:text-[#ED4A43]"
                    }`}
                  onClick={() => navigate("/favourites")}
                >
                  <FiHeart size={20} />
                </button>

                {/* Notifications */}
                <button
                  className={`transition-colors relative ${isActive("/notifications") ? "text-[#ED4A43]" : "text-gray-500 hover:text-[#ED4A43]"
                    }`}
                  onClick={() => navigate("/notifications")}
                >
                  <FaBell size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#ED4A43] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* My Bookings Button */}
            {user && (
              <button
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 font-medium ${isActive("/mybookings")
                  ? "bg-[#D43C35] text-white"
                  : "bg-gradient-to-r from-[#ED4A43] to-[#FF6B64] text-white hover:from-[#FF6B64] hover:to-[#ED4A43]"
                  }`}
                onClick={() => navigate("/mybookings")}
              >
                <FaTicketAlt className="text-white" size={16} />
                <span>My Bookings</span>
              </button>
            )}
            
            {/* Profile Dropdown - Only Show if User Exists */}
            {user && (
              <div className="relative">
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${isActive("/editprofile") ? "bg-[#D43C35] text-white" : "bg-[#ED4A43] text-white hover:bg-[#D43C35]"
                    }`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="bg-[#4CAF50] text-white font-medium rounded-full w-8 h-8 flex items-center justify-center">
                    {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium">{user?.fullName || user?.username}</span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/editprofile");
                      }}
                    >
                      <FaEdit className="mr-2 text-purple-600" />
                      Edit Profile
                    </button>

                    {/* Add My Tickets to dropdown */}
                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/mytickets");
                      }}
                    >
                      <FaTicketAlt className="mr-2 text-blue-600" />
                      My Tickets
                    </button>

                    {/* Add My Payments to dropdown */}
                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/mypayments");
                      }}
                    >
                      <FaReceipt className="mr-2 text-green-600" />
                      Payment History
                    </button>

                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>)
            }

            {!user && currentPath !== '/login' && (
              <button
                className="px-5 py-2 rounded-md transition-colors font-medium shadow-sm bg-[#ED4A43] text-white hover:bg-[#D43C35]"
                onClick={() => navigate("/login")}
              >
                LOG IN
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
