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

exports.reorderProfilePicture = async (id, image) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      throw {
        message: "User not found",
      };
    }

    // Find the image to reorder
    const imageToReorder = user.images.find(
      (image) => image._id.toString() === image.id
    );

    if (!imageToReorder) {
      throw {
        message: "Image not found",
      };
    }

    // Remove the image from its current position
    user.images = user.images.filter(
      (image) => image._id.toString() !== image.id
    );

    // Insert the image at the new index
    user.images.splice(image.newIndex, 0, imageToReorder);

    // Optionally: Normalize the indices (This step is not strictly necessary if you only use the array order)
    user.images.forEach((image, index) => {
      image.index = index;
    });

    // Save the updated user document
    await user.save();
    req.user = user;

    return req.user;
  } catch (error) {
    throw error;
  }
};

exports.updateAge = async (id, dobDate, age) => {
  try {
    // Update the user's DOB and age in the database
    const updatedUser = await User.findByIdAndUpdate(id, {
      dob: dobDate,
      age: age,
    });

    if (!updatedUser) {
      throw {
        message: "User not found",
      };
    }

    req.user = updatedUser;

    return req.user;
  } catch (error) {
    throw error;
  }
};
