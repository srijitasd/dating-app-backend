const { authenticateToken } = require("../../lib/authenticator/middlewares");
const { profileMulter } = require("../../utils/multer/multer");

const {
  uploadProfileImage,
  reorderProfilePictures,
  updateAgeRangePref,
  updateMaxDistancePref,
  updateLocation,
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

Router.patch("/profile/update-age", authenticateToken, reorderProfilePictures);

Router.patch("/profile/update-location", authenticateToken, updateLocation);

Router.patch(
  "/profile/preference/age-range",
  authenticateToken,
  updateAgeRangePref
);

Router.patch(
  "/profile/preference/max-distance",
  authenticateToken,
  updateMaxDistancePref
);

module.exports = Router;
