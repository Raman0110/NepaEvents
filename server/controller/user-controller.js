const User = require('../models/user-model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');


const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role = 'user' } = req.body;
    // Validate input fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const user = await User.exists({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8 character long"
      })
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      })
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      })
    }
    const token = jwt.sign({ user: user }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: "60000000"
    }).json({
      success: true,
      user,
      message: "Login Successful!"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const logoutUser = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (cookies) {
      Object.keys(cookies).forEach(cookieName => {
        res.clearCookie(cookieName, {
          path: "/",
        });
      });
    }
    return res.status(200).json({ message: "Logout Successful!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};


const getUser = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error!" })
  }
}
// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
};

const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { fullName, email, password } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "No user found for provided email" });

    const OTP = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = new Date(Date.now() + 2 * 60 * 1000);

    const hashedOtp = await bcrypt.hash(`${OTP}`, 10);

    await User.findOneAndUpdate({ email }, { otp: hashedOtp, otpExpiresAt: otpExpiration }, { upsert: true, new: true });

    // Check if email credentials are available
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.warn("Email credentials not found in .env file. Using test mode instead.");
      // For testing purposes, send a success response without actually sending an email
      return res.status(200).json({
        success: true,
        message: "Development mode: OTP generated successfully (not sent by email)",
        testOtp: OTP
      });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">We received a request to reset your password. Use the OTP below to proceed:</p>
          <h3 style="background: #f8f8f8; padding: 10px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 2px;">${OTP}</h3>
          <p style="font-size: 16px;">If you didn't request this, please ignore this email.</p>
          <p style="color: red; font-weight: bold;"⚠️ Do not share this OTP with anyone for security reasons.</p>
          <p style="font-size: 14px; color: #666;">Best regards,</p>
          <p style="font-size: 14px; color: #666;">NepaEvents Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return res.status(500).json({ success: false, message: "Unable to send OTP", error: error.message });
  }
};


const verifyOtp = async (req, res) => {
  const { otpCode, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "No user found for provided email" });

    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.warn("Email credentials not found. Development mode: accepting any OTP.");
      await User.updateOne({ _id: user._id }, { Rsunset: { otp: 1, otpExpiresAt: 1 } });
      return res.status(200).json({
        success: true,
        message: "Development mode: OTP verification bypassed",
        token: "dev-token"
      });
    }

    if (user.otpExpiresAt < new Date()) return res.status(410).json({ success: false, message: "Otp has expired please try again" });

    const isValidOtp = await bcrypt.compare(otpCode, user.otp);

    if (!isValidOtp) return res.status(401).json({ success: false, message: "Invalid Otp Code" });

    await User.updateOne({ _id: user._id }, { $unset: { otp: 1, otpExpiresAt: 1 } });

    res.status(200).json({ success: true, message: "Otp Verification Successful", token: "valid-token" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to Verify Otp', error: error.message });
  }
};


const resetPassword = async (req, res) => {
  const { newPassword, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
    if (!user) return res.status(404).json({ success: false, message: "No user found for provided user" });
    res.status(200).json({ success: true, message: "Password reset successfully you can login now" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error })
  }
}


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google sign-in method (user sends ID token from frontend)
const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    // Check for existing user
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but with a different provider
      if (user.provider !== 'google') {
        return res.status(400).json({
          success: false,
          message: 'Account exists with a different login method',
        });
      }
    } else {
      // Create new user with Google details
      user = await User.create({
        fullName: name,
        email,
        provider: 'google',
        role: 'user'
      });
    }

    // Generate JWT
    const token = jwt.sign({ user: user }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 604800000 // 7 days
    }).json({
      success: true,
      user,
      message: 'Google login successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




module.exports = { registerUser, loginUser, logoutUser, getUser, getAllUsers, resetPassword, sendOtp, verifyOtp, updateUserProfile, googleSignIn };



