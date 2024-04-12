const {
  uploadProfilePicture,
  reorderProfilePicture,
  updateAge,
  updateAgeRangePref,
  updateMaxDistancePref,
} = require("../service/profile.service");

const { handleResponse } = require("../../utils/response_generator/functions");

exports.uploadProfileImage = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await uploadProfilePicture(id, req.file);

    handleResponse({
      payload: {
        status: 200,
        code: "PROFILE_S001",
        data: { message: "Image uploaded successfully", user },
      },
      handler: "PROFILE_CODE_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    handleResponse({
      payload: error,
      handler: "PROFILE_CODE_HANDLER",
      success: false,
      req,
      res,
    });
  }
};

exports.reorderProfilePictures = async (req, res) => {
  const { id } = req.user;
  const { imageId, newIndex } = req.body; // Expecting imageId and the new index in the request body

  try {
    const user = await reorderProfilePicture(id, { id: imageId, newIndex });

    handleResponse({
      payload: {
        status: 200,
        code: "PROFILE_S002",
        data: { message: "Image reordered successfully", user },
      },
      handler: "PROFILE_CODE_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    handleResponse({
      payload: error,
      handler: "PROFILE_CODE_HANDLER",
      success: false,
      req,
      res,
    });
  }
};

exports.updateAge = async (req, res) => {
  try {
    const { id } = req.user; // Assuming the auth middleware sets req.user
    const { dob } = req.body; // Expecting 'dob' in the format 'YYYY-MM-DD'

    const dobDate = new Date(dob);
    const age = calculateAge(dobDate);

    const user = await updateAge(id, dobDate, age);

    handleResponse({
      payload: {
        status: 200,
        code: "PROFILE_S003",
        data: { message: "DOB and age updated successfully", user },
      },
      handler: "PROFILE_CODE_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    handleResponse({
      payload: error,
      handler: "PROFILE_CODE_HANDLER",
      success: false,
      req,
      res,
    });
  }
};

exports.updateAgeRangePref = async (req, res) => {
  try {
    const { id } = req.user; // Assuming your authentication middleware adds the user ID to req.user
    const { min, max } = req.body.ageRange;

    const user = await updateAgeRangePref(id, min, max);

    res.json({
      message: "Age range updated successfully",
      user,
    });

    handleResponse({
      payload: {
        status: 200,
        code: "PROFILE_S004",
        data: { message: "Age range updated successfully", user },
      },
      handler: "PROFILE_CODE_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    handleResponse({
      payload: error,
      handler: "PROFILE_CODE_HANDLER",
      success: false,
      req,
      res,
    });
  }
};

exports.updateMaxDistancePref = async (req, res) => {
  try {
    const { id } = req.user; // Assuming authentication middleware adds the user ID to req.user
    const { unit, value } = req.body.maxDistance;

    const user = await updateMaxDistancePref(id, unit, value);

    handleResponse({
      payload: {
        status: 200,
        code: "PROFILE_S005",
        data: { message: "Max distance updated successfully", user },
      },
      handler: "PROFILE_CODE_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    handleResponse({
      payload: error,
      handler: "PROFILE_CODE_HANDLER",
      success: false,
      req,
      res,
    });
  }
};
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
