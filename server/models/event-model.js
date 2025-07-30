const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
  artist: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  image: { type: String, required: true },
  promoCode: { type: String },
  discountPercentage: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 }
});

module.exports = mongoose.model("Event", eventSchema);