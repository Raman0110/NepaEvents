const Event = require("../models/event-model");
const Venue = require("../models/venue-model");
const { Ticket, Receipt } = require("../models/ticket-model");
const VenueBooking = require("../models/venue-booking-model");
const User = require("../models/user-model");
const mongoose = require('mongoose');

/**
 * Get payment revenue for admin dashboard
 * Includes:
 * - Events created by the admin
 * - Venue bookings for venues added by the admin
 */
const getAdminPaymentRevenue = async (req, res) => {
  try {
    const adminId = req.user.user._id;

    // 1. Get event revenue for events created by admin
    const userEvents = await Event.find({ organizer: adminId }).populate('venue');

    if (!userEvents || userEvents.length === 0) {
      return res.status(200).json({
        eventRevenue: {
          events: [],
          totalSold: 0,
          totalRevenue: 0
        },
        venueRevenue: {
          venues: [],
          totalBookings: 0,
          totalRevenue: 0
        }
      });
    }

    const eventIds = userEvents.map(event => event._id);

    // Aggregate ticket data for these events
    const ticketStats = await Ticket.aggregate([
      {
        $match: {
          event: { $in: eventIds }
        }
      },
      {
        $group: {
          _id: "$event",
          totalSold: {
            $sum: { $ifNull: ["$quantity", 0] }
          },
          totalRevenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$quantity", 0] },
                "$price"
              ]
            }
          }
        }
      }
    ]);

    // Create a map for quick lookup of ticket stats
    const statsMap = new Map();
    ticketStats.forEach(stat => {
      statsMap.set(stat._id.toString(), {
        totalSold: stat.totalSold,
        totalRevenue: stat.totalRevenue
      });
    });

    // Enrich events with ticket stats
    const eventsWithStats = userEvents.map(event => {
      const stat = statsMap.get(event._id.toString()) || { totalSold: 0, totalRevenue: 0 };
      return {
        ...event.toObject(),
        totalSold: stat.totalSold,
        totalRevenue: stat.totalRevenue
      };
    });

    // Calculate overall event totals
    const eventTotalSold = ticketStats.reduce((sum, stat) => sum + stat.totalSold, 0);
    const eventTotalRevenue = ticketStats.reduce((sum, stat) => sum + stat.totalRevenue, 0);



    // Get all receipts
    const receipts = await Receipt.find()
      .populate('venue')
      .populate('organizer')
      .lean();


    // Get unique venues from receipts
    const venueMap = new Map();
    receipts.forEach(receipt => {
      if (receipt.venue && receipt.venue._id) {
        const venueId = receipt.venue._id.toString();

        if (!venueMap.has(venueId)) {
          venueMap.set(venueId, {
            ...receipt.venue,
            totalBookings: 0,
            totalRevenue: 0
          });
        }

        const venueData = venueMap.get(venueId);
        venueData.totalBookings += 1;
        venueData.totalRevenue += receipt.amountPaid || 0;
      }
    });

    const venuesWithStats = Array.from(venueMap.values());

    // Calculate overall venue totals
    const venueTotalBookings = venuesWithStats.reduce((sum, venue) => sum + venue.totalBookings, 0);
    const venueTotalRevenue = venuesWithStats.reduce((sum, venue) => sum + venue.totalRevenue, 0);

    res.status(200).json({
      eventRevenue: {
        events: eventsWithStats,
        totalSold: eventTotalSold,
        totalRevenue: eventTotalRevenue
      },
      venueRevenue: {
        venues: venuesWithStats,
        totalBookings: venueTotalBookings,
        totalRevenue: venueTotalRevenue
      }
    });
  } catch (error) {
    console.error("Error getting admin payment revenue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAdminPaymentRevenue }; 