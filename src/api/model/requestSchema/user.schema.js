const Joi = require("joi");

exports.registerUserSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Oops! user cannot find you without your name",
    "string.base":
      "You cannot put just numbers or special characters in your name",
  }),

  email: Joi.string().email().required().messages({
    "any.required": "Oops! email is required",
    "string.base":
      "You cannot put just numbers or special characters in your email",
    "string.email": "Oops! your email looks invalid",
  }),

  contact_no: Joi.string().required().messages({
    "any.required": "Oops! email is required",
    "string.base":
      "You cannot put just numbers or special characters in your email",
    "string.email": "Oops! your email looks invalid",
  }),

  location: Joi.object({
    type: Joi.string().valid("Point").required().messages({
      "any.required": "Oops! location is required",
    }),
    coordinates: Joi.array().items(Joi.number()).required().min(2).messages({
      "any.required": "Oops! location is required",
      "array.min": "Both latitude and longitude are required!",
    }),
  })
    .required()
    .messages({
      "any.required": "Oops! location is required",
    }),
});

exports.verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Verification token is required",
  }),
});
