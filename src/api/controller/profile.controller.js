const {
  uploadProfilePicture,
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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
