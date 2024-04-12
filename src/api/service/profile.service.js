const { User } = require("../model/mongodb/user.model");

exports.uploadProfilePicture = async (id, image) => {
  try {
    const user = await User.findById(id).select("images");
    if (!user) {
      throw {
        message: "user not found!",
      };
    }

    // Construct the image object to add to the user's images array
    const image = {
      filename: image.filename,
      index: user.images.length, // Append to the end of the array
    };

    // Add the new image to the user's images array
    user.images.push(image);

    // Save the updated user document
    await user.save();
    req.user = user;

    return req.user;
  } catch (error) {
    throw error;
  }
};
