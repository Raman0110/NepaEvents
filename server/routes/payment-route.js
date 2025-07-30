const express = require("express");
const verifyToken = require("../middleware/verify-token");
const { Ticket } = require("../models/ticket-model");
const VenueBooking = require("../models/venue-booking-model");
const Event = require("../models/event-model");
const Venue = require("../models/venue-model");

const paymentRouter = express.Router();

/**
 * Get all payment data for the admin dashboard
 * This is a simplified endpoint that returns all payment data
 * without filtering by admin
 */
paymentRouter.get("/", verifyToken, async (req, res) => {
  try {
    // Get all tickets (event payments)
    const tickets = await Ticket.find()
      .populate({
        path: 'event',
        populate: [
          { path: 'venue' },
          { path: 'organizer' }
        ]
      })
      .populate('user');

    // Get all venue bookings
    const venueBookings = await VenueBooking.find({ isPaid: true })
      .populate('venue')
      .populate('organizer');

    // Format the payment data
    const paymentData = [
      // Format ticket data
      ...tickets.map(ticket => ({
        _id: ticket._id,
        type: 'event',
        eventId: ticket.event?._id,
        eventName: ticket.event?.title,
        venueId: ticket.event?.venue?._id,
        venueName: ticket.event?.venue?.name,
        userId: ticket.user?._id,
        userName: ticket.user?.fullName,
        amount: ticket.price * ticket.quantity,
        ticketCount: ticket.quantity,
        date: ticket.purchaseDate,
        organizerId: ticket.event?.organizer?._id,
        organizerName: ticket.event?.organizer?.fullName,
        transactionId: ticket.ticketCodes
      })),

      // Format venue booking data
      ...venueBookings.map(booking => ({
        _id: booking._id,
        type: 'venue',
        venueId: booking.venue?._id,
        venueName: booking.venue?.name,
        userId: booking.organizer?._id,
        userName: booking.organizer?.fullName,
        amount: booking.amountPaid,
        date: booking.paymentDate,
        transactionId: booking.transactionId
      }))
    ];

    res.status(200).json(paymentData);
  } catch (error) {
    console.error("Error getting payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = paymentRouter; 