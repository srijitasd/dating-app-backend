const { authenticateToken } = require("../../lib/authenticator/middlewares");
const { profileMulter } = require("../../utils/multer/multer");

const {
  uploadProfileImage,
} = require("../controller/profile.controller");
const Router = require("express").Router();

Router.post(
  "/profile/upload-image",
  authenticateToken,
  profileMulter.single("image"),
  uploadProfileImage
);

Router.patch(
  "/profile/reorder-image",
  authenticateToken,
  reorderProfilePictures
);
module.exports = Router;
