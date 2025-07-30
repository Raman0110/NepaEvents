import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaUsers, FaTags } from "react-icons/fa";
const logo = "/images/logo.png"; 

export const AdminSidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed shadow-lg">
      {/* Logo and Name */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-700">
        <img src={logo} alt="NepaEvents Logo" className="h-8 w-8" />
        <h2 className="text-xl font-bold tracking-wide">NepaEvents</h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        <NavLink
          to="/admin/home"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive ? "bg-gray-800 text-[#ED4A43] font-medium" : "hover:bg-gray-800/70"
            }`
          }
        >
          <FaTachometerAlt className="text-lg" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/events"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive ? "bg-gray-800 text-[#ED4A43] font-medium" : "hover:bg-gray-800/70"
            }`
          }
        >
          <FaCalendarAlt className="text-lg" />
          <span>Events</span>
        </NavLink>
        <NavLink
          to="/admin/venues"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive ? "bg-gray-800 text-[#ED4A43] font-medium" : "hover:bg-gray-800/70"
            }`
          }
        >
          <FaMapMarkerAlt className="text-lg" />
          <span>Venues</span>
        </NavLink>
        <NavLink
          to="/admin/category"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive ? "bg-gray-800 text-[#ED4A43] font-medium" : "hover:bg-gray-800/70"
            }`
          }
        >
          <FaTags className="text-lg" />
          <span>Category</span>
        </NavLink>
        <NavLink
          to="/admin/payment"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive ? "bg-gray-800 text-[#ED4A43] font-medium" : "hover:bg-gray-800/70"
            }`
          }
        >
          <FaMoneyBillWave className="text-lg" />
          <span>Payments</span>
        </NavLink>
        <NavLink
          to="/admin/userlist"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive ? "bg-gray-800 text-[#ED4A43] font-medium" : "hover:bg-gray-800/70"
            }`
          }
        >
          <FaUsers className="text-lg" />
          <span>Users</span>
        </NavLink>
      </nav>
    </div>
  );
};