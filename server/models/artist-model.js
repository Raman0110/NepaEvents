const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  genre: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Artist", artistSchema);