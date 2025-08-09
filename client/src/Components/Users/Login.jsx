import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-hot-toast";
import { useAuth } from '../../Context/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';

export const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const otpInputs = useRef([]);

  // Password reset states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    try {
      const res = await axios.post('http://localhost:3000/login', values, {
        withCredentials: true,
      });
      if (res) {
        setUser(res.data);
        toast.success("Logged in successfully");
        if (res.data.user.role === "user") {
          navigate('/')
          window.location.reload();
        } else {
          navigate('/admin/home')
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
      console.error("Error posting data:", error);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/users/sendOtp', { email });
      if (response) {
        toast.success("OTP sent successfully");
        setOtpSent(true);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to send OTP.";
      toast.error(errorMessage);
      console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otp = otpInputs.current.map(input => input.value).join('');
    try {
      const res = await axios.post('http://localhost:3000/api/users/verifyOtp', {
        otpCode: otp, email
      });
      if (res) {
        toast.success("OTP verified successfully");
        setResetToken(res.data.token);
        setOtpVerified(true);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Invalid OTP.";
      toast.error(errorMessage);
      console.error("Error verifying OTP:", error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordMatch(false);
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/users/resetPassword', {
        newPassword: password, email
      });

      if (res) {
        toast.success("Password reset successfully");
        setShowForgotPassword(false);
        setOtpSent(false);
        setOtpVerified(false);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to reset password.";
      toast.error(errorMessage);
      console.error("Error resetting password:", error);
    }
  };

  const handleGuestLogin = () => {
    navigate('/');
  };

  const handleOtpChange = (e, index) => {
    const input = e.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const otpRegex = /^\d{6}$/;

    if (otpRegex.test(pastedData)) {
      Array.from(pastedData).forEach((char, index) => {
        if (index < 6) {
          otpInputs.current[index].value = char;
        }
      });
      otpInputs.current[5].focus();
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (confirmPassword) {
      setPasswordMatch(e.target.value === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const toggleLoginPasswordVisibility = () => {
    setLoginPasswordVisible(!loginPasswordVisible);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        'http://localhost:3000/api/users/google',
        { idToken: credentialResponse.credential },
        { withCredentials: true }
      );
      if (!res.data.success) {
        throw new Error('Unable to sigin with google')
      }
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Login Failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg backdrop-blur-sm bg-white/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Section with Wave Design */}
        <div className="relative h-32 bg-gradient-to-r from-[#ED4A43] to-[#F27A74]">
          <div className="absolute bottom-0 left-0 w-full">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V120Z" fill="white" fillOpacity="0.8" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white absolute top-8 left-0 w-full text-center">
            {showForgotPassword ?
              (otpSent ?
                (otpVerified ? "Reset Password" : "Enter OTP")
                : "Reset Password")
              : "Welcome Back"}
          </h2>
        </div>

        {/* Form Section */}
        <div className="px-8 py-6">
          {showForgotPassword ? (
            otpSent ? (
              otpVerified ? (
                // Password Reset Form
                <form className="space-y-5" onSubmit={handleResetPassword}>
                  <p className="text-gray-600 text-center mb-4">
                    Create a new password for <strong>{email}</strong>
                  </p>

                  {/* New Password Field */}
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder=" "
                      className="w-full bg-transparent pt-5 pb-2 px-3 border-b-2 border-gray-300 focus:border-[#ED4A43] focus:outline-none peer transition"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                    />
                    <label htmlFor="password" className="absolute left-3 top-4 text-gray-500 transition-all duration-300 transform -translate-y-3 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#ED4A43]">
                      New Password
                    </label>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={togglePasswordVisibility}
                    >
                      {passwordVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative">
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder=" "
                      className={`w-full bg-transparent pt-5 pb-2 px-3 border-b-2 ${!passwordMatch ? 'border-red-500' : 'border-gray-300 focus:border-[#ED4A43]'} focus:outline-none peer transition`}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                    />
                    <label htmlFor="confirmPassword" className={`absolute left-3 top-4 ${!passwordMatch ? 'text-red-500' : 'text-gray-500'} transition-all duration-300 transform -translate-y-3 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${passwordMatch ? 'peer-focus:text-[#ED4A43]' : 'peer-focus:text-red-500'}`}>
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {confirmPasswordVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {!passwordMatch && (
                    <p className="text-red-500 text-sm">Passwords do not match</p>
                  )}

                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long and include a mix of uppercase, lowercase, numbers, and special characters.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#ED4A43] text-white font-medium rounded-full hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                  >
                    Reset Password
                  </button>

                  <button
                    type="button"
                    className="w-full py-2.5 bg-[#FFF5F4] text-gray-700 font-medium rounded-full border border-[#ED4A43] hover:bg-white transition"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setOtpSent(false);
                      setOtpVerified(false);
                    }}
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                // OTP Verification Form
                <form className="space-y-5" onSubmit={handleVerifyOTP}>
                  <p className="text-gray-600 text-center">
                    We've sent a 6-digit code to <strong>{email}</strong>
                  </p>

                  <div className="flex justify-center gap-2 my-6">
                    {[...Array(6)].map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-[#ED4A43] focus:outline-none transition"
                        ref={el => otpInputs.current[index] = el}
                        onChange={e => handleOtpChange(e, index)}
                        onKeyDown={e => handleKeyDown(e, index)}
                        onPaste={index === 0 ? handlePaste : null}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#ED4A43] text-white font-medium rounded-full hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                  >
                    Verify OTP
                  </button>

                  <div className="flex justify-end text-sm mt-4">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setOtpSent(false);
                      }}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )
            ) : (
              // Request OTP Form
              <form className="space-y-5" onSubmit={handleRequestOTP}>
                <div className="relative">
                  <input
                    type="email"
                    id="resetEmail"
                    name="email"
                    placeholder=" "
                    className="w-full bg-transparent pt-5 pb-2 px-3 border-b-2 border-gray-300 focus:border-[#ED4A43] focus:outline-none peer transition"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <label htmlFor="resetEmail" className="absolute left-3 top-4 text-gray-500 transition-all duration-300 transform -translate-y-3 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#ED4A43]">
                    Email address
                  </label>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Enter your email address and we'll send you a verification code to reset your password.
                </p>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#ED4A43] text-white font-medium rounded-full hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                >
                  Send OTP
                </button>

                <button
                  type="button"
                  className="w-full py-2.5 bg-[#FFF5F4] text-gray-700 font-medium rounded-full border border-[#ED4A43] hover:bg-white transition"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </button>
              </form>
            )
          ) : (
            // Original Login Form
            <>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    id="email"
                    name="email"
                    placeholder=" "
                    className="w-full bg-transparent pt-5 pb-2 px-3 border-b-2 border-gray-300 focus:border-[#ED4A43] focus:outline-none peer transition"
                  />
                  <label htmlFor="email" className="absolute left-3 top-4 text-gray-500 transition-all duration-300 transform -translate-y-3 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#ED4A43]">
                    Email address or phone number
                  </label>
                </div>

                <div className="relative">
                  <input
                    type={loginPasswordVisible ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder=" "
                    className="w-full bg-transparent pt-5 pb-2 px-3 border-b-2 border-gray-300 focus:border-[#ED4A43] focus:outline-none peer transition"
                  />
                  <label htmlFor="password" className="absolute left-3 top-4 text-gray-500 transition-all duration-300 transform -translate-y-3 scale-75 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#ED4A43]">
                    Password
                  </label>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={toggleLoginPasswordVisibility}
                  >
                    {loginPasswordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#ED4A43] text-white font-medium rounded-full hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                >
                  Sign In
                </button>
              </form>

              <div className="text-right mt-2">
                <span
                  className="text-sm text-[#ED4A43] font-medium hover:text-red-700 cursor-pointer"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </span>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <div className="px-3 text-sm text-gray-500">or continue with</div>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Authentication */}
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.error('Google Login Failed')}
              />

              {/* Additional Options */}
              <div className="space-y-3 mt-5">
                <button
                  type="button"
                  className="w-full py-2.5 bg-[#ED4A43] text-white font-medium rounded-full hover:shadow-lg transition duration-300"
                  onClick={() => navigate('/signup')}
                >
                  Create New Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};