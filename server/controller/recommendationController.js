const { getHybridRecommendations } = require('../services/hybrid');

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.user._id; 
    const recommendations = await getHybridRecommendations(userId);
    res.status(200).json(recommendations); // Return the list of recommended events
  } catch (err) {
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
};
module.exports = getRecommendations;