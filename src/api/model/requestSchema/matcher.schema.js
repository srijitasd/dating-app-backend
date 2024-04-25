const Joi = require("joi");

exports.swipeRequestSchema = Joi.object({
  swipedId: Joi.string().required().messages({
    "any.required": "Oops! swiped user is required",
  }),

  action: Joi.string().valid("like", "pass").required().messages({
    "any.required": "Oops! email is required",
    "string.valid": "You can only pass like and pass",
  }),
});
