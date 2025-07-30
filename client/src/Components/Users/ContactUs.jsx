import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaComment, FaPaperPlane, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";

export const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Message sent successfully! Thank you for reaching out.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold relative inline-block">
            <span className="bg-clip-text text-transparent bg-[#ED4A43]">
              Contact Us
            </span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question about our services,
            pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden lg:col-span-1 transform transition-all hover:shadow-xl">
            <div className="bg-gradient-to-r from-[#ED4A43] to-[#FF6B64] text-white p-8">
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <p className="mb-6 opacity-90">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-red-50 p-3 rounded-full text-[#ED4A43] mr-4">
                    <FaPhone className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1">Phone</h4>
                    <p className="text-gray-600">+977 9800000000</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-red-50 p-3 rounded-full text-[#ED4A43] mr-4">
                    <FaEnvelope className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1">Email</h4>
                    <p className="text-gray-600">event.management@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-red-50 p-3 rounded-full text-[#ED4A43] mr-4">
                    <FaMapMarkerAlt className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1">Location</h4>
                    <p className="text-gray-600">Tinkune, Kathmandu, Nepal</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-red-50 p-3 rounded-full text-[#ED4A43] mr-4">
                    <FaClock className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1">Business Hours</h4>
                    <p className="text-gray-600">Monday - Friday: 9AM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:col-span-2">
            {/* Success message */}
            {formStatus && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
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

            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="col-span-1">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your Name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED4A43] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-1">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED4A43] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="col-span-2">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    Your Message
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FaComment className="text-gray-400" />
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="How can we help you?"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED4A43] focus:border-transparent transition-colors"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="col-span-2">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-[#ED4A43] to-[#FF6B64] text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center w-full md:w-auto"
                  >
                    <FaPaperPlane className="mr-2" />
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};