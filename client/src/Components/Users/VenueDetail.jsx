import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaBuilding,
  FaHeart,
  FaCalendarAlt,
  FaInfoCircle,
  FaArrowLeft,
  FaTrashAlt, FaMapMarked
} from "react-icons/fa";
import venueImage from "/public/images/event1.png";
import axios from "axios";
import VenueLocationMap from "../VenueLocationMap";

export const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [venue, setVenue] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    artist: "",
    image: "",
    price: "",
  });

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        // Get today's date in YYYY-MM-DD format to pass as query parameter
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`http://localhost:3000/api/venue/${id}?date=${today}`);
        setVenue(response.data.data);
        setSelectedVenue(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || "Failed to fetch venue details.";
        console.error("Error fetching venue:", errorMessage);
      }
    }
    fetchVenue();
  }, []);

  // Map initialization
  useEffect(() => {
    // This would be replaced with actual map initialization code
    const loadMap = async () => {
      // Simulate map loading
      setTimeout(() => {
        setMapLoaded(true);
      }, 1000);
    };

    loadMap();
  }, []);

  // Open booking modal
  const handleBookNow = () => {
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsBookingConfirmed(false);
  };

  // Handle booking confirmation
  const handleBookingConfirmation = (e) => {
    e.preventDefault();
    setIsBookingConfirmed(true);
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Go back to venues list
  const goBack = () => {
    navigate(-1);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price' && value < 0) {
      return; // Prevent negative value from being set
    }

    setBookingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check venue availability when date changes
    if (name === 'date' && value) {
      checkVenueAvailability(value);
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setBookingDetails((prev) => ({ ...prev, image: null }));
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookingDetails((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  //Fetch categories
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

  // In your VenueDetail component, modify the amenities section
  const defaultAmenities = [
    { name: "Wi-Fi", icon: "📶" },
    { name: "Parking", icon: "🅿️" },
    { name: "Sound System", icon: "🔊" },
    { name: "Lighting", icon: "💡" },
    { name: "Stage", icon: "🎤" },
    { name: "Restrooms", icon: "🚻" },
  ];

  // Then in your render, combine venue-specific amenities with defaults
  const allAmenities = [...(venue?.amenities || []), ...defaultAmenities];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check venue availability first
      const isAvailable = await checkVenueAvailability(bookingDetails.date);
      if (!isAvailable) {
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("venue", venue._id);
      formData.append("title", bookingDetails.title);
      formData.append("description", bookingDetails.description);
      formData.append("category", bookingDetails.category);
      formData.append("date", bookingDetails.date);
      formData.append("artist", bookingDetails.artist);
      formData.append("ticketPrice", bookingDetails.price);
      formData.append("image", bookingDetails.image);

      console.log(bookingDetails.image)

      await axios.post("http://localhost:3000/api/venue-bookings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      toast.success("Booking request sent successfully!");
      setIsBookingConfirmed(true);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to submit booking. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check venue availability when date changes
  const checkVenueAvailability = async (date) => {
    try {
      if (!date) return true;

      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await axios.get(`http://localhost:3000/api/venue/${id}/availability/${formattedDate}`);

      if (!response.data.available) {
        toast.error("This venue is already booked for the selected date.");
        // Add to booked dates if not already there
        setBookedDates(prev => [...new Set([...prev, formattedDate])]);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking venue availability:", error);
      toast.error("Failed to check venue availability.");
      return false;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-[#ED4A43] mb-8 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Venues
        </button>

        {/* Venue Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          <div className="relative">
            <img
              src={`http://localhost:3000/${venue?.image}`}
              alt={venue?.name}
              className="w-full h-96 object-cover object-center"
            />
            <button
              onClick={toggleFavorite}
              className="absolute top-6 right-6 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
            >
              <FaHeart
                size={22}
                className={isFavorite ? "text-[#ED4A43]" : "text-gray-400"}
              />
            </button>

            {/* Booking status indicator */}
            {venue?.isBooked && (
              <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                BOOKED
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              {/* Venue Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{venue?.name}</h1>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-[#ED4A43]" />
                    <span>{venue?.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaUsers className="mr-2 text-[#ED4A43]" />
                    <span>Capacity: {venue?.capacity} people</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaBuilding className="mr-2 text-[#ED4A43]" />
                    <span className="font-semibold">Venue</span>
                  </div>
                </div>
              </div>

              {/* Booking status information */}
              {venue?.isBooked && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-red-500 mt-1 mr-3" />
                    <div>
                      <h3 className="font-bold text-red-600">This venue is already booked</h3>
                      <p className="text-gray-700">
                        Booking date: {venue?.bookingDate ? new Date(venue.bookingDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price and Book Now */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center">
                <p className="text-lg mb-1 text-gray-500">Price per day</p>
                <p className="text-3xl font-bold text-[#ED4A43] mb-4">Rs. {venue?.price}</p>
                <button
                  onClick={handleBookNow}
                  className={`bg-[#ED4A43] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#d43c35] transition-colors ${bookingDetails.date && bookedDates.includes(new Date(bookingDetails.date).toISOString().split('T')[0])
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                    }`}
                  disabled={bookingDetails.date && bookedDates.includes(new Date(bookingDetails.date).toISOString().split('T')[0])}
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Amenities */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {allAmenities?.map((amenity, index) => (
                <div key={index} className="flex items-center text-gray-700">
                  <div className="text-[#ED4A43] mr-2">{amenity.icon}</div>
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <FaMapMarked className="text-[#ED4A43] mr-2 text-xl" />
              <h3 className="text-2xl font-bold text-gray-800">Location</h3>
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <VenueLocationMap existingCoordinates={venue?.locationCoordinates} />
            </div>
          </div>
        </div>

      </div>
      {isModalOpen && selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#ED4A43] to-[#FF7A6E] p-6 text-white">
              <h3 className="text-2xl font-bold">
                {isBookingConfirmed ? "Booking Confirmed" : `Book ${selectedVenue.name}`}
              </h3>
              <p className="text-red-100 text-sm mt-1">
                {isBookingConfirmed
                  ? "Thank you for your booking"
                  : "All fields marked are required to complete your booking"}
              </p>
            </div>

            {!isBookingConfirmed ? (
              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                        Event Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={bookingDetails.title}
                        onChange={handleChange}
                        placeholder="Enter event title"
                        className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                        Event Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={bookingDetails.description}
                        onChange={handleChange}
                        placeholder="Enter event description"
                        rows="3"
                        className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                        Event Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={bookingDetails.category}
                        onChange={handleChange}
                        className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories && categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                        Event Price
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={bookingDetails.price}
                        onChange={handleChange}
                        placeholder="Enter the event price"
                        className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                        min="0"
                      />
                    </div>

                    <div>
                      <label htmlFor="artist" className="block text-gray-700 font-medium mb-2">
                        Artist
                      </label>
                      <input
                        type="text"
                        id="artist"
                        name="artist"
                        value={bookingDetails.artist}
                        onChange={handleChange}
                        placeholder="Enter artist name"
                        className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-5 bg-red-50 rounded-xl border border-red-100">
                      <h3 className="text-gray-700 font-semibold mb-4 flex items-center">
                        <FaCalendarAlt className="h-5 w-5 mr-2 text-[#ED4A43]" />
                        Event Details
                      </h3>

                      <div>
                        <label htmlFor="date" className="block text-gray-700 font-medium mb-2 text-sm">
                          Event Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={bookingDetails.date}
                          onChange={handleChange}
                          className="w-full p-3 bg-white border border-red-200 rounded-lg focus:outline-none focus:border-[#ED4A43]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Venue Image
                      </label>
                      {imagePreview ? (
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
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            className="hidden"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            name="image"
                          />
                          <label
                            htmlFor="image-upload"
                            className="w-full flex items-center justify-center p-4 border-2 border-dashed border-red-300 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
                          >
                            <div className="text-center">
                              <svg
                                className="mx-auto h-10 w-10 text-[#ED4A43]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <p className="mt-1 text-sm text-[#ED4A43]">Click to upload image</p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="p-5 bg-red-50 rounded-xl border border-red-100">
                      <h3 className="text-gray-700 font-semibold mb-4 flex items-center">
                        <FaInfoCircle className="h-5 w-5 mr-2 text-[#ED4A43]" />
                        Venue Information
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Name:</strong> {selectedVenue.name}</p>
                        <p><strong>Location:</strong> {selectedVenue.location}</p>
                        <p><strong>Capacity:</strong> {selectedVenue.capacity}</p>
                        <p><strong>Price:</strong> Rs. {selectedVenue.price}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="bg-gray-300 py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#ED4A43] text-white py-2 px-6 rounded-lg hover:bg-[#c93a34] transition"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-8">
                <h3 className="text-center text-xl font-semibold text-[#ED4A43] mb-4">
                  Your booking for {selectedVenue.name} has been confirmed!
                </h3>
                <p className="text-center text-lg text-gray-600">
                  We will send you the booking details and confirmation shortly.
                </p>
                <div className="text-center mt-8">
                  <button
                    onClick={closeModal}
                    className="bg-[#ED4A43] text-white py-2 px-6 rounded-lg hover:bg-[#c93a34] transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

};
export default VenueDetail;