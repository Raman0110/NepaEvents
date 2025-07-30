const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["venue_approval", "payment_success", "ticket_reminder", "general"],
    default: "general"
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  relatedItem: {
    itemId: { type: mongoose.Schema.Types.ObjectId },
    itemType: { type: String, enum: ["venue", "event", "ticket", "booking"] }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Notification", notificationSchema); 