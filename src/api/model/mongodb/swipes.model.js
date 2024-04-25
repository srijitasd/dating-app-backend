const mongoose = require("mongoose");

const swipeSchema = new mongoose.Schema({
  swiperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  swipedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: { type: String, enum: ["like", "pass"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Swipe = mongoose.model("Swipe", swipeSchema);

module.exports = { Swipe };
