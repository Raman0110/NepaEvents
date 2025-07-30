import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';

export const Signup = () => {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        'http://localhost:3000/api/users/google',
        { idToken: credentialResponse.credential },
        { withCredentials: true }
      );
      if (!res.data.success) {
        throw new Error('Unable to sign in with Google');
      }
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Login Failed:', error);
      toast.error('Google login failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        interests: selectedInterests,
        role: 'user' 
      };

      const { data } = await axios.post('http://localhost:3000/api/users/register', payload);

      if (data) {
        toast.success(data.message);
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
      console.error("Error posting data:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg backdrop-blur-sm bg-white/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-[#ED4A43] to-[#F27A74]">
          <div className="absolute bottom-0 left-0 w-full">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V120Z" fill="white" fillOpacity="0.8" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white absolute top-8 left-0 w-full text-center">Create an Account</h2>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder=" "
                className="w-full bg-transparent pt-5 pb-2 px-3 border-b-2 border-gray-300 focus:border-[#ED4A43] focus:outline-none peer transition"
                required
              />
              <label htmlFor="fullName" className="absolute left-3 top-4 text-gray-500 transition-all duration-300 transform -translate-y-3 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#ED4A43]">
                Full Name
              </label>
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=" "
                className="w-full bg-transparent pt-5 pb-2 px-3 border-b-2 border-gray-300 focus:border-[#ED4A43] focus:outline-none peer transition"
                required
              />
              <label htmlFor="email" className="absolute left-3 top-4 text-gray-500 transition-all duration-300 transform -translate-y-3 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#ED4A43]">
                Email Address
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                className="w-full bg-transparent pt-5 pb-2 px-3 border-b-2 border-gray-300 focus:border-[#ED4A43] focus:outline-none peer transition pr-10" // Added pr-10 for padding
                required
              />
              <label htmlFor="password" className="absolute left-3 top-4 text-gray-500 transition-all duration-300 transform -translate-y-3 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#ED4A43]">
                Password
              </label>
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#ED4A43] focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#ED4A43] text-white font-medium rounded-full hover:shadow-lg transition duration-300 transform hover:-translate-y-1 mt-4"
            >
              Sign Up
            </button>
          </form>

          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">
              By signing up, you agree to our Terms & Conditions.
            </span>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <div className="px-3 text-sm text-gray-500">or continue with</div>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.error('Google Login Failed');
                toast.error('Google login failed');
              }}
            />
          </div>

          <div className="mt-5">
            <button
              type="button"
              className="w-full py-2.5 bg-[#FFF5F4] text-gray-700 font-medium rounded-full border border-[#ED4A43] hover:bg-white transition"
              onClick={() => navigate('/login')}
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};