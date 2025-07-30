const Event = require('../models/event-model');
const User = require('../models/user-model');

const getContentBasedRecommendations = async (userId) => {
  try {
    // Fetch the user's favorited events and interests
    const user = await User.findById(userId).populate({
      path: 'favoriteEvents',
      populate: [
        { path: 'venue' },
        { path: 'category' }
      ]
    });

    // If the user has no favorites, return an empty array
    if (!user.favoriteEvents || user.favoriteEvents.length === 0) {
      return [];
    }

    // Extract categories from user's favorite events
    const userCategories = user.favoriteEvents
      .filter(event => event.category)
      .map(event => event.category._id);

    // Extract unique category IDs
    const uniqueCategoryIds = [...new Set(userCategories.map(id => id.toString()))];

    // If no categories are found, try to use user interests
    if (uniqueCategoryIds.length === 0 && user.interests && user.interests.length > 0) {
      return [];
    }

    // Find events with similar categories that the user hasn't favorited
    const favoritedEventIds = user.favoriteEvents.map(event => event._id);
    
    // Find events in similar categories that the user hasn't favorited
    const recommendedEvents = await Event.find({
      category: { $in: uniqueCategoryIds },
      _id: { $nin: favoritedEventIds }
    })
    .populate('venue')
    .populate('organizer')
    .populate('category')
    .limit(10);

    return recommendedEvents;
  } catch (error) {
    console.error("Error in content-based recommendations:", error);
    return [];
  }
};

module.exports = { getContentBasedRecommendations };
