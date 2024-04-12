const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "profile-images/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate a unique filename: user-{userId}-{timestamp}.{ext}
    const ext = path.extname(file.originalname);
    const filename = `user-${req.params.userId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const profileMulter = multer({ storage: storage });

module.exports = { profileMulter };
