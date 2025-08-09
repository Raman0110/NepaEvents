import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FaMapMarkerAlt, FaUsers, FaBuilding, FaHeart, FaSearch, FaCalendarAlt, FaInfoCircle, FaTrashAlt
} from "react-icons/fa";
import { Link } from "react-router-dom";

export const BookVenue = () => {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState(null);
  const [venues, setVenues] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    artist: "",
    image: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price' && value < 0) {
      return; // Prevent negative value from being set
    }

    setBookingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVenue(null);
    setIsBookingConfirmed(false);
    setImagePreview(null);
    setBookingDetails({
      title: "",
      description: "",
      category: "",
      date: "",
      artist: "",
      image: "",
      price: 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if image is provided
      if (!bookingDetails.image) {
        toast.error("Please upload an event image");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("venue", selectedVenue._id);
      formData.append("title", bookingDetails.title);
      formData.append("description", bookingDetails.description);
      formData.append("category", bookingDetails.category);
      formData.append("date", bookingDetails.date);
      formData.append("artist", bookingDetails.artist);
      formData.append("ticketPrice", bookingDetails.price);
      formData.append("image", bookingDetails.image);

      console.log("Uploading image:", bookingDetails.image);

      const response = await axios.post("http://localhost:3000/api/venue-bookings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      console.log("Booking response:", response.data);
      toast.success("Booking request sent successfully!");
      setIsBookingConfirmed(true);
    } catch (error) {
      console.error("Booking error:", error);
      // Show detailed error message from the server if available
      const errorMsg = error.response?.data?.message || "Failed to submit booking. Please try again!";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
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

  //fetch venues
  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await axios.get("http://localhost:3000/api/venue");
        console.log("Fetched venues:", response.data);
        setVenues(response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Failed to load venues");
      }
    }
    fetchVenues();
  }, [refreshTrigger]); // Only refresh when this value changes

  const handleBookNow = (venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
  };

  const toggleFavorite = async (venueId) => {
    try {
      if (favorites.includes(venueId)) {
        await axios.delete(`http://localhost:3000/api/venue/${venueId}/favorite`, {
          withCredentials: true
        });
        setFavorites(favorites.filter(id => id !== venueId));
      } else {
        await axios.post(`http://localhost:3000/api/venue/${venueId}/favorite`, {}, {
          withCredentials: true
        });
        setFavorites([...favorites, venueId]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await axios.get('http://localhost:3000/api/venue/user/favorites', {
          withCredentials: true
        });
        setFavorites(response.data.map(venue => venue._id));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }

    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn]);

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ED4A43] to-[#ED4A43] mb-2 text-center">
          Book a Venue
        </h2>
        <p className="text-center text-gray-500 mb-12">
          Find and book the perfect venue for your event
        </p>

        <div className="mb-10 max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search venues by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 px-12 bg-white border-2 border-red-100 rounded-full focus:outline-none focus:border-[#ED4A43] shadow-lg"
            />
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredVenues.map((venue) => (
            <div
              key={venue._id}
              className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 w-full">
                    <button
                      onClick={() => handleBookNow(venue)}
                      className="w-full bg-[#ED4A43] text-white py-3 rounded-lg font-bold hover:bg-[#c93a34] transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
                <Link to={`/venue/${venue._id}`} className="block">
                  <img
                    src={`http://localhost:3000/${venue.image}`}
                    alt={venue.name}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(venue._id);
                  }}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                >
                  <FaHeart
                    size={18}
                    className={favorites.includes(venue._id) ? "text-[#ED4A43]" : "text-gray-400"}
                  />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">{venue.name}</h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-[#ED4A43]" />
                    <span>{venue?.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaUsers className="mr-2 text-[#ED4A43]" />
                    <span>Capacity: {venue.capacity}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaBuilding className="mr-2 text-[#ED4A43]" />
                    <span className="font-semibold">Venue</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-[#ED4A43]">Rs. {venue.price}</p>
                  <button
                    onClick={() => handleBookNow(venue)}
                    className="bg-[#ED4A43] text-white py-2 px-4 rounded-lg hover:bg-[#c93a34] transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-10">
            <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">No venues found</h3>
            <p className="text-gray-500 mt-2">Try changing your search criteria</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#ED4A43] to-[#FF7A6E] p-6 text-white">
              <h3 className="text-2xl font-bold">
                {isBookingConfirmed ? "Booking Requested" : `Book ${selectedVenue.name}`}
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
                        Event Image
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
                        <div className="flex flex-col items-center border-2 border-dashed border-red-100 rounded-lg p-4 bg-white">
                          <label htmlFor="image-upload" className="cursor-pointer w-full">
                            <div className="flex flex-col items-center">
                              <div className="bg-red-50 rounded-full p-3 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ED4A43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-sm font-medium text-center text-[#ED4A43]">
                                Click to upload event image
                              </p>
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                PNG, JPG, or JPEG. Max 5MB.
                              </p>
                            </div>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              required
                            />
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
                        className="bg-[#ED4A43] text-white py-2 px-6 rounded-lg hover:bg-[#c93a34] transition disabled:bg-red-300"
                        disabled={isSubmitting || !bookingDetails.image}
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
                  Your request for booking {selectedVenue.name} has been forwarded to admin!
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
  )
}

export default BookVenue;