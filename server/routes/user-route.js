const express = require('express');
const { registerUser, loginUser, logoutUser, getUser, getAllUsers, sendOtp, verifyOtp, resetPassword, updateUserProfile, googleSignIn } = require('../controller/user-controller');
const verifyToken = require('../middleware/verify-token');

const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/getProfile', verifyToken, getUser)
router.get('/list', getAllUsers);

//to reset password
router.post("/sendOtp", sendOtp)
router.post("/verifyOtp", verifyOtp)
router.post("/resetPassword", resetPassword)

//update profile
router.put("/updateProfile/:id", verifyToken, updateUserProfile)


// Route for Google login
router.post('/google', googleSignIn);

module.exports = router;
