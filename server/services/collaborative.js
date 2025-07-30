const User = require('../models/user-model');
const Event = require('../models/event-model');

const getCollaborativeRecommendations = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: 'purchasedTickets',
      populate: { path: 'event' }
    });
    
    // Get the events the user has attended (from their tickets)
    const userAttendedEventIds = user.purchasedTickets
      .filter(ticket => ticket.event) // Ensure the event exists on the ticket
      .map(ticket => ticket.event._id.toString());

    // If user hasn't purchased any tickets, try using favorites
    if (userAttendedEventIds.length === 0) {
      return [];
    }

    // Find users who have attended similar events
    const similarUsers = await User.find({
      _id: { $ne: userId }, // Exclude current user
      purchasedTickets: { $exists: true, $not: { $size: 0 } }
    }).populate({
      path: 'purchasedTickets',
      populate: { path: 'event' }
    });

    // Collect event IDs from similar users that the current user hasn't attended
    const recommendedEventIds = new Set();
    
    for (const otherUser of similarUsers) {
      if (otherUser.purchasedTickets && otherUser.purchasedTickets.length > 0) {
        for (const ticket of otherUser.purchasedTickets) {
          if (ticket.event && !userAttendedEventIds.includes(ticket.event._id.toString())) {
            recommendedEventIds.add(ticket.event._id.toString());
          }
        }
      }
    }

    // Fetch full event details with venue and organizer information
    const events = await Event.find({
      _id: { $in: Array.from(recommendedEventIds) }
    })
    .populate('venue')
    .populate('organizer')
    .populate('category')
    .limit(10); // Limit to 10 recommendations
    
    return events;
  } catch (error) {
    console.error("Error in collaborative recommendations:", error);
    return [];
  }
};

module.exports = { getCollaborativeRecommendations };
