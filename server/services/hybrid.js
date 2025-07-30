// services/recommendation/hybrid.js

const { getContentBasedRecommendations } = require('./contentBased');
const { getCollaborativeRecommendations } = require('./collaborative');

const getHybridRecommendations = async (userId) => {
  try {
    // Fetch content-based recommendations
    const contentBased = await getContentBasedRecommendations(userId);
    // Fetch collaborative filtering recommendations
    const collaborative = await getCollaborativeRecommendations(userId);
    // Combine both sets of recommendations
    const combined = [...contentBased, ...collaborative];
    
    // If no recommendations, return empty array
    if (combined.length === 0) {
      return [];
    }
    
    // Deduplicate recommendations by event ID
    const eventMap = new Map();
    combined.forEach(event => {
      if (!eventMap.has(event._id.toString())) {
        eventMap.set(event._id.toString(), event);
      }
    });
    
    // Convert map back to array and sort by date (most recent first)
    const uniqueEvents = Array.from(eventMap.values()).sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    // Limit to 10 recommendations
    return uniqueEvents.slice(0, 10);
  } catch (error) {
    console.error("Error in hybrid recommendations:", error);
    return []; // Return empty array on error
  }
};

module.exports = { getHybridRecommendations };
