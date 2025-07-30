import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaEye, FaUserCircle, FaCalendarAlt, FaEnvelope, FaTag } from "react-icons/fa";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/users/list");
        console.log(response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="container mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-[#ED4A43] mb-10 tracking-tight">
          User List
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div 
              key={user._id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <FaUserCircle className="text-[#ED4A43] text-3xl" />
                    <h3 className="text-xl font-bold text-gray-800">{user.fullName}</h3>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      user.role === 'admin' 
                        ? 'bg-[#ED4A43] text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2 text-[#ED4A43]" />
                    <p className="truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex justify-end"> 
                  <button
                    onClick={() => viewUserDetails(user)}
                    className="bg-gray-50 border border-[#ED4A43] text-[#ED4A43] hover:bg-[#ED4A43] hover:text-white p-2 rounded-lg transition-all duration-300 flex items-center group"
                  >
                    <FaEye size={16} className="group-hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-full p-8 relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-[#ED4A43] transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="text-center mb-6">
                <FaUserCircle className="mx-auto text-6xl text-[#ED4A43] mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">{selectedUser.fullName}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaEnvelope className="mr-3 text-[#ED4A43]" />
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div className="flex items-center">
                  <FaTag className="mr-3 text-[#ED4A43]" />
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-[#ED4A43]" />
                  <p className="font-medium">Joined {formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowDetailModal(false)}
                className="mt-6 w-full bg-[#ED4A43] text-white px-4 py-2 rounded-lg hover:bg-[#D43C35] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserList;