const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, require: true },
  locationCoordinates: {type: String, required: true},
});

module.exports = mongoose.model("Venue", venueSchema);