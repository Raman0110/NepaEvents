import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaUser, FaTag, FaPlus, FaImage, FaTicketAlt, FaPercent, FaUsers } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

export const AdminEventPage = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    description: "",
    venue: "",
    price: "",
    artist: "",
    category: "",
    image: "",
    promoCode: "",
    discountPercentage: "",
    usageLimit: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const isPastEvent = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison
    const eventDateObj = new Date(eventDate);
    return eventDateObj < today;
  };

  // Fetch venues
  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await axios.get("http://localhost:3000/api/venue");
        setVenues(response.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch venues");
      }
    }
    fetchVenues();
  }, []);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("http://localhost:3000/api/category");
        setCategories(response.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch categories");
      }
    }
    fetchCategories();
  }, []);

  // Function to fetch events
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/event");
      setEvents(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of events
  useEffect(() => {
    fetchEvents();
  }, []);

  // Open modal for new event
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setImagePreview(null);
    setNewEvent({
      name: "",
      date: "",
      description: "",
      venue: "",
      price: "",
      artist: "",
      category: "",
      image: "",
      promoCode: "",
      discountPercentage: "",
      usageLimit: ""
    });
    setShowModal(true);
  };

  // Add or Edit Event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", newEvent.name);
    formData.append("date", newEvent.date);
    formData.append("description", newEvent.description);
    formData.append("venue", newEvent.venue);
    formData.append("price", newEvent.price);
    formData.append("artist", newEvent.artist);
    formData.append("category", newEvent.category);
    if (newEvent.image && typeof newEvent.image !== 'string') {
      formData.append("image", newEvent.image);
    }

    // Ensure promo code fields are properly set and log them
    console.log("Promo code fields being sent:", {
      promoCode: newEvent.promoCode,
      discountPercentage: newEvent.discountPercentage,
      usageLimit: newEvent.usageLimit
    });

    formData.append("promoCode", newEvent.promoCode || "");
    formData.append("discountPercentage", newEvent.discountPercentage || "0");
    formData.append("usageLimit", newEvent.usageLimit || "0");

    try {
      if (selectedEvent) {
        // Update existing event
        const response = await axios.patch(`http://localhost:3000/api/event/${selectedEvent._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
        console.log("Update response:", response.data);
        toast.success("Event updated successfully!");
      } else {
        // Create new event
        const response = await axios.post("http://localhost:3000/api/event", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
        console.log("Create response:", response.data);
        toast.success("Event created successfully!");
      }

      // Refresh events list
      fetchEvents();

      // Reset form and close modal
      setShowModal(false);
      setSelectedEvent(null);
      setImagePreview(null);
      setNewEvent({
        name: "",
        date: "",
        description: "",
        venue: "",
        price: "",
        artist: "",
        category: "",
        image: "",
        promoCode: "",
        discountPercentage: "",
        usageLimit: ""
      });
    } catch (error) {
      console.log(error);
      toast.error(selectedEvent ? "Failed to update event!" : "Failed to create event!");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Edit Modal
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    console.log("Editing event with data:", event);

    // Set image preview if available
    if (event.image) {
      setImagePreview(event.image.startsWith('http') ? event.image : `http://localhost:3000/${event.image}`);
    } else {
      setImagePreview(null);
    }

    setNewEvent({
      name: event.title,
      date: event.date ? event.date.split('T')[0] : '', // Format date for input
      description: event.description,
      venue: event.venue,
      price: event.price,
      artist: event.artist,
      category: event.category,
      image: event.image,
      promoCode: event.promoCode || "",
      discountPercentage: event.discountPercentage || "",
      usageLimit: event.usageLimit || ""
    });

    console.log("New event state set to:", {
      promoCode: event.promoCode || "",
      discountPercentage: event.discountPercentage || "",
      usageLimit: event.usageLimit || ""
    });

    setShowModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  // Confirm and execute event deletion
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:3000/api/event/${eventToDelete}`, {
        withCredentials: true
      });
      toast.success("Event deleted successfully!");
      fetchEvents(); // Refresh the events list
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete event");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEvent((prev) => ({ ...prev, image: file }));

      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Remove image
  const handleImageRemove = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview); // Clean up memory
    }
    setImagePreview(null);
    setNewEvent((prev) => ({ ...prev, image: null }));
  };

  const getCategoryName = (categoryId) => {
    if (!categories || categories.length === 0) return "Loading...";
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const getVenueName = (venueId) => {
    if (!venues || venues.length === 0) return "Loading...";
    const venue = venues.find(v => v._id === venueId);
    return venue ? venue.name : "Unknown Venue";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ED4A43] to-[#ED4A43] mb-2 text-center">Event Dashboard</h2>
        <p className="text-center text-gray-500 mb-12">Manage and organize your events in one place</p>

        {/* Add New Event Button */}
        <div className="flex justify-end mb-10">
          <button
            onClick={handleAddEvent}
            className="bg-[#ED4A43] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center"
          >
            <span className="mr-2">+</span> Create New Event
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {events.length > 0 ? (
            events
              .filter(event => !event.isRequested && !isPastEvent(event.date))
              .map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group relative flex flex-col"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-6 w-full">
                        <div className="flex justify-between">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="bg-white/90 text-[#ED4A43] p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="bg-white/90 text-[#ED4A43] p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                          >
                            <FaTrashAlt size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <img
                      src={`http://localhost:3000/${event.image}`}
                      alt={event.title}
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  </div>

                  <div className="p-6 flex-grow">
                    {/* Event Title */}
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{event.title}</h3>

                    {/* Event Description */}
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2 text-[#ED4A43] flex-shrink-0" />
                        <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-[#ED4A43] flex-shrink-0" />
                        <span className="text-sm truncate">{getVenueName(event.venue._id)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaMoneyBillWave className="mr-2 text-[#ED4A43] flex-shrink-0" />
                        <span className="font-semibold text-sm">Rs. {event.price}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaUser className="mr-2 text-[#ED4A43] flex-shrink-0" />
                        <span className="text-sm truncate">{event.artist}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaTag className="mr-2 text-[#ED4A43] flex-shrink-0" />
                        <span className="text-sm truncate">{getCategoryName(event.category)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="px-4 py-3 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md"
                      >
                        <FaEdit className="mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="px-4 py-3 rounded-lg flex items-center justify-center bg-[#ED4A43] text-white hover:shadow-md"
                      >
                        <FaTrashAlt className="mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <FaCalendarAlt className="mx-auto text-gray-300 text-6xl mb-4" />
              <h3 className="text-xl font-medium text-gray-500">No events found</h3>
              <p className="text-gray-400 mt-2">Click the "Create New Event" button to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding/Editing Event */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#ED4A43] to-[#FF7A6E] p-6 text-white">
              <h3 className="text-2xl font-bold">
                {selectedEvent ? "Update Event Details" : "Create Your Event"}
              </h3>
              <p className="text-red-100 text-sm mt-1">
                All fields marked are required to create your event
              </p>
            </div>

            <form onSubmit={handleSaveEvent} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Event Title */}
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newEvent.name}
                      onChange={handleChange}
                      placeholder="Give your event a catchy title"
                      className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                      required
                    />
                  </div>

                  {/* Event Description */}
                  <div>
                    <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
                      Event Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={newEvent.description}
                      onChange={handleChange}
                      placeholder="Describe what makes your event special..."
                      rows="5"
                      className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                      required
                    ></textarea>
                  </div>

                  {/* Event Image */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Event Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        accept="image/*"
                      />
                      <label
                        htmlFor="image-upload"
                        className="w-full flex items-center justify-center p-3 border-2 border-dashed border-red-300 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-48">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageRemove();
                              }}
                              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                            >
                              <FaTimesCircle className="text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="mx-auto h-10 w-10 text-[#ED4A43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-1 text-sm text-[#ED4A43]">
                              {selectedEvent && newEvent.image ? 'Change image' : 'Click to upload image'}
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <h3 className="text-gray-700 font-semibold mb-4 flex items-center">
                      <FaTicketAlt className="h-5 w-5 mr-2 text-purple-600" />
                      Promotional Offers
                    </h3>

                    {/* Promo Code */}
                    <div className="mb-4">
                      <label htmlFor="promoCode" className="block text-gray-700 font-medium mb-1 text-sm">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        id="promoCode"
                        name="promoCode"
                        value={newEvent.promoCode}
                        onChange={handleChange}
                        placeholder="e.g. SUMMER2023"
                        className="w-full p-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty if no promotion</p>
                    </div>

                    {/* Two Column Grid for Discount and Usage Limit */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Discount Percentage */}
                      <div>
                        <label htmlFor="discountPercentage" className="block text-gray-700 font-medium mb-1 text-sm">
                          Discount (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="discountPercentage"
                            name="discountPercentage"
                            value={newEvent.discountPercentage}
                            onChange={handleChange}
                            placeholder="10"
                            min="0"
                            max="100"
                            className="w-full p-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaPercent className="text-gray-400 h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {/* Usage Limit */}
                      <div>
                        <label htmlFor="usageLimit" className="block text-gray-700 font-medium mb-1 text-sm">
                          Usage Limit
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="usageLimit"
                            name="usageLimit"
                            value={newEvent.usageLimit}
                            onChange={handleChange}
                            placeholder="100"
                            min="0"
                            className="w-full p-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaUsers className="text-gray-400 h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Event Details Section */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <h3 className="text-gray-700 font-semibold mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-[#ED4A43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Event Details
                    </h3>

                    {/* Two Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Event Date */}
                      <div>
                        <label htmlFor="date" className="block text-gray-700 font-medium mb-1 text-sm">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={newEvent.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:border-[#ED4A43]"
                          required
                        />
                      </div>

                      {/* Ticket Price */}
                      <div>
                        <label htmlFor="price" className="block text-gray-700 font-medium mb-1 text-sm">
                          Price (Rs.)
                        </label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={newEvent.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full p-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:border-[#ED4A43]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-gray-700 font-medium mb-1">
                      Event Category
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        value={newEvent.category}
                        onChange={handleChange}
                        className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl appearance-none focus:outline-none focus:border-[#ED4A43] transition-colors"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories && categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-[#ED4A43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Artist */}
                  <div>
                    <label htmlFor="artist" className="block text-gray-700 font-medium mb-1">
                      Artist/Performer
                    </label>
                    <input
                      type="text"
                      id="artist"
                      name="artist"
                      value={newEvent.artist}
                      onChange={handleChange}
                      placeholder="Who's performing or presenting?"
                      className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                      required
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <label htmlFor="venue" className="block text-gray-700 font-medium mb-1">
                      Venue
                    </label>
                    <div className="relative">
                      <select
                        id="venue"
                        name="venue"
                        value={newEvent.venue}
                        onChange={handleChange}
                        className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl appearance-none focus:outline-none focus:border-[#ED4A43] transition-colors"
                        required
                      >
                        <option value="">Select Venue</option>
                        {venues && venues.map((venue) => (
                          <option key={venue._id} value={venue._id}>
                            {venue.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-[#ED4A43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
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
                  type="submit"
                  className="px-10 py-4 bg-[#ED4A43] text-white font-semibold rounded-xl shadow-lg hover:bg-[#D43C35] transform hover:-translate-y-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#ED4A43] focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {selectedEvent ? "Save Changes" : "Create Event"}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrashAlt className="text-[#ED4A43] text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete Event</h3>
              <p className="text-gray-600 mt-2">Are you sure you want to delete this event? This action cannot be undone.</p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEventToDelete(null);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEvent}
                className="px-6 py-3 bg-[#ED4A43] text-white rounded-lg hover:bg-[#D43C35] transition-colors font-medium flex items-center"
              >
                <FaTrashAlt className="mr-2" /> Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};