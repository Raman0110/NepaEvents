import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    category: "",
    venue: "",
    artist: "",
    image: null
  });

  const [formStatus, setFormStatus] = useState("");
  const [venues, setVenues] = useState(null);
  const [categories, setCategories] = useState(null);
  const navigate = useNavigate();

  // Fetch venues and categories from API
  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await axios.get("http://localhost:3000/api/venue");
        setVenues(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchVenues();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("http://localhost:3000/api/category");
        setCategories(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("date", formData.date);
    submitData.append("price", formData.price);
    submitData.append("category", formData.category);
    submitData.append("venue", formData.venue);
    submitData.append("artist", formData.artist);
    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      const response = await axios.post("http://localhost:3000/api/event", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      
      toast.success("Event submitted for approval!");
      setFormStatus("Event submitted successfully! It has been sent for admin approval and might be rejected or approved.");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create event!");
      setFormStatus("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with decorative elements */}
        <div className="relative mb-12 text-center">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-[#ED4A43] rounded-full opacity-70"></div>
          <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ED4A43] to-[#FF7A6E] inline-block">
            Create Your Event
          </h2>
          <div className="mt-4 flex justify-center space-x-1">
            <span className="h-1 w-12 bg-[#ED4A43] rounded-full"></span>
            <span className="h-1 w-6 bg-[#FF7A6E] rounded-full"></span>
            <span className="h-1 w-2 bg-[#FFB4AE] rounded-full"></span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-3xl shadow-xl overflow-hidden border border-red-100">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#ED4A43] to-[#FF7A6E] p-6 text-white">
            <p className="text-lg font-medium">
              Design your perfect event with the form below
            </p>
            <p className="text-red-100 text-sm mt-1">
              All fields marked are required to create your event
            </p>
          </div>

          {formStatus && (
            <div className="m-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-green-700 font-medium">{formStatus}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Event Title */}
                <div>
                  <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Give your event a catchy title"
                    className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
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
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Describe what makes your event special..."
                    rows="5"
                    className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
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
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full p-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:border-[#ED4A43]"
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
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                        className="w-full p-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:border-[#ED4A43]"
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
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl appearance-none focus:outline-none focus:border-[#ED4A43] transition-colors"
                    >
                      <option value="">Select Category</option>
                      {categories && categories.map((category, index) => (
                        <option key={index} value={category._id}>
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
                    value={formData.artist}
                    onChange={handleChange}
                    required
                    placeholder="Who's performing or presenting?"
                    className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl focus:outline-none focus:border-[#ED4A43] transition-colors"
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
                      value={formData.venue}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-red-50 border-2 border-red-100 rounded-xl appearance-none focus:outline-none focus:border-[#ED4A43] transition-colors"
                    >
                      <option value="">Select Venue</option>
                      {venues && venues.map((venue, index) => (
                        <option key={index} value={venue._id}>
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

            {/* Submit Button */}
            <div className="mt-10 text-center">
              <button
                type="submit"
                className="px-10 py-4 bg-[#ED4A43] text-white font-semibold rounded-xl shadow-lg hover:bg-[#D43C35] transform hover:-translate-y-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#ED4A43] focus:ring-offset-2"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Event
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};