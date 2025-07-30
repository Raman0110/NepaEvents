const mongoose = require("mongoose")

const venueBookingSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  eventDetails: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    ticketPrice: { type: Number, required: true },
    image: { type: String, required: true },
    artist: { type: String, required: true },
  },
})
module.exports = mongoose.model("VenueBooking", venueBookingSchema);