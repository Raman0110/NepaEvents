const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
  amountPaid: { type: Number, required: true },
  transactionId: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  quantity: { type: Number, required: false, min: 1 },
  price: { type: Number, required: true },
  ticketCodes: [{ type: String }],
  purchaseDate: { type: Date, default: Date.now },
});

module.exports = {
  Receipt: mongoose.model("Receipt", receiptSchema),
  Ticket: mongoose.model("Ticket", ticketSchema),
};
