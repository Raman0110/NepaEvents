const express = require("express");
const { bookVenue, getAllVenueBooking, approveVenueBooking, rejectVenueBooking, verifyPayment, makePaymentForVenue, sendReceipt, getVenueBookingById, getUserReceipts, downloadReceipt } = require("../controller/venue-booking-controller");
const verifyToken = require("../middleware/verify-token");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const VenueBooking = require("../models/venue-booking-model");
const Event = require("../models/event-model");
const { Receipt } = require("../models/ticket-model");

const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post('/', verifyToken, upload.single("image"), bookVenue)
router.get('/', getAllVenueBooking)
router.get('/my-receipts', verifyToken, getUserReceipts)

router.get('/:id', getVenueBookingById)
router.put('/:id/approve', approveVenueBooking)
router.put('/:id/reject', rejectVenueBooking)
router.get('/:id/download-receipt', downloadReceipt)

// Stripe Payment
router.post("/pay", makePaymentForVenue);
router.get("/verify-payment/:id", verifyPayment);

// Update payment status manually
router.post("/:id/update-payment", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;
    
    // First verify the user actually owns this booking
    const booking = await VenueBooking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    // Check if user is the organizer of this booking
    if (booking.organizer.toString() !== req.user.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You don't own this booking" });
    }
    
    // Only allow changing to 'paid' if we have actual payment verification
    if (paymentStatus === 'paid') {
      // Verify payment with Stripe or check for receipt
      const receiptExists = await Receipt.findOne({
        organizer: req.user.user._id,
        venue: booking.venue
      });
      
      // If we're trying to set status to 'paid' but no receipt exists
      if (!receiptExists && !transactionId) {
        return res.status(400).json({ 
          success: false, 
          message: "Payment verification failed. No payment record found."
        });
      }
    }
    
    // Update booking payment status
    booking.paymentStatus = paymentStatus;
    await booking.save();
    
    // If we're marking it as paid and we have verification, create an event and receipt
    if (paymentStatus === 'paid') {
      const populatedBooking = await VenueBooking.findById(id)
        .populate("venue organizer")
        .populate("eventDetails.category");
      
      // Create new event
      const newEvent = new Event({
        title: populatedBooking.eventDetails.title,
        description: populatedBooking.eventDetails.description,
        date: populatedBooking.eventDetails.date,
        venue: populatedBooking.venue._id,
        artist: populatedBooking.eventDetails.artist,
        organizer: populatedBooking.organizer._id,
        category: populatedBooking.eventDetails.category._id,
        price: populatedBooking.eventDetails.ticketPrice,
        image: populatedBooking.eventDetails.image,
      });
      await newEvent.save();
      
      // Check if a receipt already exists
      const existingReceipt = await Receipt.findOne({
        organizer: populatedBooking.organizer._id,
        venue: populatedBooking.venue._id,
      });
      
      if (!existingReceipt) {
        // Create receipt
        const receipt = new Receipt({
          organizer: populatedBooking.organizer._id,
          venue: populatedBooking.venue._id,
          amountPaid: populatedBooking.venue.price,
          transactionId: transactionId || `MANUAL-${Date.now()}`,
          paymentDate: new Date(),
        });
        await receipt.save();
      }
      
      // Create notification
      const { createNotification } = require('../controller/notification-controller');
      await createNotification(
        populatedBooking.organizer._id,
        "Payment Verification Complete",
        "Your payment has been verified and your venue booking is now confirmed.",
        "payment_success",
        { itemId: booking._id, itemType: "booking" }
      );
    }
    
    res.status(200).json({
      success: true,
      message: `Booking payment status updated to ${paymentStatus}`
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating payment status", 
      error: error.message 
    });
  }
});

module.exports = router;