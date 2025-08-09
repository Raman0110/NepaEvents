import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaUsers, FaBuilding, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import VenueLocationMap from "../VenueLocationMap";

export const AdminVenuePage = () => {
  const [venues, setVenues] = useState([]);
  const [activeTab, setActiveTab] = useState("adminVenues"); // "adminVenues" or "requestedVenues"
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger venue refresh
  const [imagePreview, setImagePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [newVenue, setNewVenue] = useState({
    name: "",
    location: "",
    capacity: "",
    image: "",
    price: "",
    locationCoordinates: "",
  });
  const [showDetailModal, setShowDetailModal] = useState(false); // State for detail view modal
  const [detailVenue, setDetailVenue] = useState(null);
  const [requestedVenueFilter, setRequestedVenueFilter] = useState("all");
  const [bookingVenue, setBookingVenue] = useState(null);
  // Add or Edit Venue
  const handleSaveVenue = async () => {
    const formData = new FormData();
    formData.append("name", newVenue.name);
    formData.append("location", newVenue.location);
    formData.append("capacity", newVenue.capacity);
    formData.append("price", newVenue.price);
    formData.append("locationCoordinates", newVenue.locationCoordinates);
    formData.append("isAdminAdded", true);
    if (newVenue.image) {
      formData.append("image", newVenue.image);
    }
    try {
      console.log(formData);
      if (selectedVenue) {
        // Edit existing venue
        await axios.patch(`http://localhost:3000/api/venue/${selectedVenue._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
        toast.success("Venue updated successfully!");
      } else {
        // Create new venue
        await axios.post("http://localhost:3000/api/venue", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
        setImagePreview(null);
        toast.success("Venue added successfully!");
      }
      setShowModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error saving venue:", error);
      toast.error("Failed to save venue. Please try again!");
    }
  };

  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await axios.get("http://localhost:3000/api/venue");
        setVenues(response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Failed to load venues");
      }
    }
    fetchVenues();
  }, [refreshTrigger]); // Only refresh when this value changes


  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await axios.get("http://localhost:3000/api/venue-bookings");
        setBookingVenue(response.data.bookings);
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Failed to load venues");
      }
    }
    fetchBookings();
  }, [refreshTrigger]);

  // Open Edit Modal
  const handleEditVenue = (venue) => {
    setSelectedVenue(venue);
    setNewVenue(venue);
    setShowModal(true);
  };

  // Delete Venue
  const handleDeleteVenue = async (venueId) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await axios.delete(`http://localhost:3000/api/venue/${venueId}`, {
          withCredentials: true
        });
        toast.success("Venue deleted successfully!");
        setRefreshTrigger(prev => prev + 1); // Trigger a refresh
      } catch (error) {
        console.error("Error deleting venue:", error);
        toast.error("Failed to delete venue. Please try again!");
      }
    }
  };

  // Approve Venue
  const handleApproveVenue = async (venueId) => {
    try {
      await axios.put(`http://localhost:3000/api/venue-bookings/${venueId}/approve`);
      toast.success("Venue approved successfully!");
      setRefreshTrigger(prev => prev + 1); // Trigger a refresh
    } catch (error) {
      console.error("Error approving venue:", error);
      toast.error("Failed to approve venue. Please try again!");
    }
  };

  // Reject Venue
  const handleRejectVenue = async (venueId) => {
    try {
      await axios.put(`http://localhost:3000/api/venue-bookings/${venueId}/reject`);
      toast.success("Venue rejected successfully!");
      setRefreshTrigger(prev => prev + 1); // Trigger a refresh
    } catch (error) {
      console.error("Error rejecting venue:", error);
      toast.error("Failed to reject venue. Please try again!");
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVenue((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewVenue((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // setSelectedVenue((prev) => ({ ...prev, image: reader.result }))
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setNewVenue((prev) => ({ ...prev, image: null }));
    setSelectedVenue((prev) => ({ ...prev, image: null }))
  }

  const getStatusColor = (status) => {
    if (status === "approved") return "bg-green-100 text-green-800 border-green-300";
    if (status === "rejected") return "bg-red-100 text-red-800 border-red-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  const getStatusText = (status) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  // Open Detail View Modal
  const handleViewDetails = (venue) => {
    setDetailVenue(venue);
    setShowDetailModal(true);
  };

  // Filter venues based on the selected filter
  const getFilteredVenues = () => {
    if (!bookingVenue) return [];
    if (requestedVenueFilter === "all") return bookingVenue;
    return bookingVenue.filter(venue => venue.status === requestedVenueFilter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ED4A43] to-[#ED4A43] mb-2 text-center">Venue Dashboard</h2>
        <p className="text-center text-gray-500 mb-12">Manage and organize your venues in one place</p>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full shadow-md inline-flex p-1">
            <button
              onClick={() => setActiveTab("adminVenues")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${activeTab === "adminVenues"
                ? "bg-[#ED4A43] text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Venues Added by Admin
            </button>
            <button
              onClick={() => setActiveTab("requestedVenues")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${activeTab === "requestedVenues"
                ? "bg-[#ED4A43] text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Requested Venues by User
            </button>
          </div>
        </div>

        {/* Add New Venue Button - Only show in admin venues tab */}
        {activeTab === "adminVenues" && (
          <div className="flex justify-end mb-10">
            <button
              onClick={() => {
                setSelectedVenue(null);
                setNewVenue({
                  name: "",
                  location: "",
                  capacity: "",
                  image: "",
                  price: "",
                });
                setShowModal(true);
              }}
              className="bg-[#ED4A43] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center"
            >
              <span className="mr-2">+</span> Create New Venue
            </button>
          </div>
        )}

        {/* Admin Added Venues */}
        {activeTab === "adminVenues" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {venues.length > 0 ? venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group relative cursor-pointer"
                onClick={() => handleViewDetails(venue)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 w-full">
                      <div className="flex justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditVenue(venue);
                          }}
                          className="bg-white/90 text-[#ED4A43] p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVenue(venue.id);
                          }}
                          className="bg-white/90 text-[#ED4A43] p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <img
                    src={`http://localhost:3000/${venue.image}`}
                    alt={venue.name}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{venue.name}</h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-[#ED4A43]" />
                      <span>{venue.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2 text-[#ED4A43]" />
                      <span>Capacity: {venue.capacity}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaBuilding className="mr-2 text-[#ED4A43]" />
                      <span className="font-semibold">{venue.name}</span>
                    </div>
                  </div>

                  {/* Admin venues have edit and delete buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditVenue(venue);
                      }}
                      className="px-4 py-3 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVenue(venue._id);
                      }}
                      className="px-4 py-3 rounded-lg flex items-center justify-center bg-[#ED4A43] text-white hover:shadow-md"
                    >
                      <FaTrashAlt className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-16">
                <div className="text-5xl text-gray-300 mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-500">No venues added by admin yet</h3>
                <p className="text-gray-400 mt-2">Click the "Create New Venue" button to add one</p>
              </div>
            )}
          </div>
        )}

        {/* User Requested Venues */}
        {activeTab === "requestedVenues" && (
          <>
            {/* Filter Buttons */}
            <div className="flex justify-end mb-8">
              <div className="bg-white rounded-lg shadow-md inline-flex p-2 space-x-2">
                <button
                  onClick={() => setRequestedVenueFilter("all")}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${requestedVenueFilter === "all"
                    ? "bg-[#ED4A43] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRequestedVenueFilter("approved")}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${requestedVenueFilter === "approved"
                    ? "bg-green-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setRequestedVenueFilter("rejected")}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${requestedVenueFilter === "rejected"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  Rejected
                </button>
                <button
                  onClick={() => setRequestedVenueFilter("pending")}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${requestedVenueFilter === "pending"
                    ? "bg-yellow-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Venue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {bookingVenue && getFilteredVenues().length > 0 ?
                getFilteredVenues().map((venue) => (
                  <div
                    key={venue.id}
                    className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group relative cursor-pointer"
                    onClick={() => handleViewDetails(venue)}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-6 w-full">
                          <div className="flex justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditVenue(venue);
                              }}
                              className="bg-white/90 text-[#ED4A43] p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVenue(venue.id);
                              }}
                              className="bg-white/90 text-[#ED4A43] p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                            >
                              <FaTrashAlt size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <img
                        src={`http://localhost:3000/${venue?.venue?.image}`}
                        alt={venue.name}
                        className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full border ${getStatusColor(venue.status)} text-xs font-bold`}
                      >
                        {getStatusText(venue.status)}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-800">{venue?.venue?.name}</h3>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-gray-600">
                          <FaMapMarkerAlt className="mr-2 text-[#ED4A43]" />
                          <span>{venue?.venue?.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaUsers className="mr-2 text-[#ED4A43]" />
                          <span>Capacity: {venue?.venue?.capacity}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaBuilding className="mr-2 text-[#ED4A43]" />
                          <span className="font-semibold">{venue?.venue?.name}</span>
                        </div>
                      </div>

                      {/* User requested venues have approve and reject buttons */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveVenue(venue?._id);
                          }}
                          className={`px-4 py-3 rounded-lg flex items-center justify-center ${venue.status !== "pending"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-md"
                            }`}
                          disabled={venue.status !== "pending"}
                        >
                          <FaCheckCircle className="mr-2" /> Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectVenue(venue._id);
                          }}
                          className={`px-4 py-3 rounded-lg flex items-center justify-center ${venue.status !== "pending"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#ED4A43] text-white hover:shadow-md"
                            }`}
                          disabled={venue.status !== "pending"}
                        >
                          <FaTimesCircle className="mr-2" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
                :
                (
                  <div className="col-span-3 text-center py-16">
                    <div className="text-5xl text-gray-300 mb-4">🏢</div>
                    <h3 className="text-xl font-semibold text-gray-500">
                      {requestedVenueFilter === "all"
                        ? "No booking requests yet"
                        : `No ${requestedVenueFilter} venue requests found`}
                    </h3>
                  </div>
                )}
            </div>
          </>
        )}
      </div>


      {/* Modal for Adding/Editing Venue */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#ED4A43] to-[#FF7A6E] p-6 text-white">
              <h3 className="text-2xl font-bold">
                {selectedVenue ? "Update Venue Details" : "Create Your Venue"}
              </h3>
              <p className="text-red-100 text-sm mt-1">
                All fields marked are required to create your venue
              </p>
            </div>

            <form className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Venue Name */}
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newVenue.name}
                      onChange={handleChange}
                      placeholder="Enter venue name"
                      className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                    />
                  </div>

                  {/* Venue Location */}
                  <div>
                    <label htmlFor="location" className="block text-gray-700 font-medium mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={newVenue.location}
                      onChange={handleChange}
                      placeholder="Enter venue location"
                      className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                    />
                    <VenueLocationMap setNewVenue={setNewVenue} />
                  </div>

                  {/* Venue Price */}
                  <div>
                    <label htmlFor="price" className="block text-gray-700 font-medium mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={newVenue.price}
                      onChange={handleChange}
                      placeholder="Enter venue price"
                      className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                    />
                  </div>

                  {/* Venue Image */}
                  {imagePreview ? (
                    <div className="mb-3">
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleImageRemove}
                          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                        >
                          <FaTrashAlt size={14} className="text-[#ED4A43]" />
                        </button>
                      </div>
                    </div>
                  ) :
                    (
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Venue Image
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="w-full flex items-center justify-center p-3 border-2 border-dashed border-red-300 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
                          >
                            <div className="text-center">
                              <svg className="mx-auto h-10 w-10 text-[#ED4A43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="mt-1 text-sm text-[#ED4A43]">Click to upload image</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )
                  }
                </div>
                {/* Right Column */}
                <div className="space-y-6">
                  {/* Venue Details Section */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <h3 className="text-gray-700 font-semibold mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-[#ED4A43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Venue Details
                    </h3>

                    {/* Capacity Input */}
                    <div>
                      <label htmlFor="capacity" className="block text-gray-700 font-medium mb-1 text-sm">
                        Capacity
                      </label>
                      <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        value={newVenue.capacity}
                        onChange={handleChange}
                        placeholder="Enter venue capacity"
                        className="w-full p-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:border-[#ED4A43]"
                      />
                    </div>
                  </div>

                  {/* Additional Information about the venue could go here */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <h3 className="text-gray-700 font-semibold mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-[#ED4A43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Important Information
                    </h3>
                    <p className="text-sm text-gray-600">
                      Venues must be approved by an administrator before they can be used for events.
                      Make sure all information is accurate and the image clearly shows the venue.
                    </p>
                  </div>

                </div>
              </div>


              {/* Submit Button Area */}
              <div className="mt-10 text-center flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveVenue}
                  className="px-10 py-4 bg-[#ED4A43] text-white font-semibold rounded-xl shadow-lg hover:bg-[#D43C35] transform hover:-translate-y-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#ED4A43] focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {selectedVenue ? "Save Changes" : "Create Venue"}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Venue Details */}
      {showDetailModal && detailVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#ED4A43] to-[#FF7A6E] p-6 text-white">
              <h3 className="text-2xl font-bold">
                Venue Details
              </h3>
              <p className="text-red-100 text-sm mt-1">
                Detailed information about the venue
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Venue Image */}
                  <div className="relative w-full h-56 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={`http://localhost:3000/${detailVenue?.image || detailVenue?.venue?.image}`}
                      alt={detailVenue?.name || detailVenue?.venue?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Important Information Section - for Requested Venues */}
                  {activeTab === "requestedVenues" && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <h3 className="text-gray-700 font-semibold mb-4 flex items-center">
                        <FaInfoCircle className="h-5 w-5 mr-2 text-[#ED4A43]" />
                        Important Information
                      </h3>
                      <p className="text-sm text-gray-600">
                        This venue is {detailVenue?.status === "approved" ? "approved" : "pending approval"}.
                      </p>
                    </div>
                  )}

                  {/* Venue Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Venue Name
                    </label>
                    <p className="text-gray-900">{detailVenue?.name || detailVenue?.venue?.name}</p>
                  </div>

                  {/* Venue Location */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Location
                    </label>
                    <p className="text-gray-900">{detailVenue?.location || detailVenue?.venue?.location}</p>
                  </div>

                  {/* Venue Capacity */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Capacity
                    </label>
                    <p className="text-gray-900">{detailVenue?.capacity || detailVenue?.venue?.capacity}</p>
                  </div>
                </div>


                {/* Right Column */}
                <div className="space-y-6">
                  {/* Additional Fields for "Requested Venues by User" */}
                  {activeTab === "requestedVenues" && (
                    <>
                      {/* Organizer Name */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Organizer Name
                        </label>
                        <p className="text-gray-900">{detailVenue?.organizer?.fullName}</p>
                      </div>

                      {/* Organizer Email */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">{detailVenue?.organizer?.email}</p>
                      </div>

                      {/* Event Title */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Event Title
                        </label>
                        <p className="text-gray-900">{detailVenue?.eventDetails?.title}</p>
                      </div>

                      {/* Event Description */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Description
                        </label>
                        <p className="text-gray-900">{detailVenue?.eventDetails?.description}</p>
                      </div>

                      {/* Artist*/}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Artist
                        </label>
                        <p className="text-gray-900">{detailVenue?.eventDetails?.artist}</p>
                      </div>

                      {/* Event Date */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Event Date
                        </label>
                        <p className="text-gray-900">
                          {new Date(detailVenue?.eventDetails?.date).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Event Category */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Category
                        </label>
                        <p className="text-gray-900">{detailVenue?.eventDetails?.category?.name}</p>
                      </div>

                      {/* Event Price */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Price
                        </label>
                        <p className="text-gray-900">Rs.{detailVenue?.eventDetails?.ticketPrice}</p>
                      </div>
                    </>
                  )}

                  {/* Show map only for admin venues */}
                  {activeTab === "adminVenues" && (
                    <VenueLocationMap
                      existingCoordinates={detailVenue.locationCoordinates}
                    />
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};