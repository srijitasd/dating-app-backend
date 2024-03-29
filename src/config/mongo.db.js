const mongoose = require("mongoose");

// Options for MongoDB connection
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, options)
  .then(() => {
    console.log("Connected to MongoDB successfully");

    // You can start performing database operations here...
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
