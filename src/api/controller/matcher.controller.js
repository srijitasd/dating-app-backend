const { swipeRequestSchema } = require("../model/requestSchema/matcher.schema");
const {
  swipeService,
  nearByUsersService,
} = require("../service/matcher.service");

exports.swipeController = async (req, res) => {
  const { id } = req.user; // Assuming authentication middleware adds the user ID to req.user
  const { swipedId, action } = req.body; // action can be 'like' or 'pass'
  try {
    await swipeRequestSchema.validateAsync({ swipedId, action });

    const resp = await swipeService({ swiperId: id, swipedId, action });

    handleResponse({
      payload: {
        status: 200,
        code: "MATCHER_S001",
        data: resp,
      },
      handler: "MATCHER_CODE_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    handleResponse({
      payload: error,
      handler: "MATCHER_CODE_HANDLER",
      success: false,
      req,
      res,
    });
  }
};
