const Event = require('../models/event-model');
const User = require('../models/user-model');

const getContentBasedRecommendations = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: 'favoriteEvents',
      populate: [
        { path: 'venue' },
        { path: 'category' }
      ]
    });

    if (!user.favoriteEvents || user.favoriteEvents.length === 0) return [];

    const userCategories = user.favoriteEvents
      .filter(event => event.category)
      .map(event => event.category._id);

    const uniqueCategoryIds = [...new Set(userCategories.map(id => id.toString()))];

    if (uniqueCategoryIds.length === 0 && user.interests && user.interests.length > 0) {
      return [];
    }

    const favoritedEventIds = user.favoriteEvents.map(event => event._id);

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
