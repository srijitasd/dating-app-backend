const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // cognito_id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact_no: { type: String, required: true, unique: true },
    images: [
      {
        file: String,
        index: Number, // Used to order images
      },
    ],
    age: Number,
    preferences: {
      interests: [String], // List of user interests
      ageRange: { min: Number, max: Number }, // Desired age range for potential matches
      maxDistance: Number, // Maximum distance for potential matches in meters
    },
    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
