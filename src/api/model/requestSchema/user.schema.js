const Joi = require("joi");

exports.registerUserSchema = Joi.object({
  name: Joi.string()
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        console.log(err.code);
        switch (err.code) {
          case "any.required":
            err.message = "Oops! user cannot find you without your name";
            break;
          default:
            break;
        }
        switch (err.code) {
          case "string.base":
            err.message =
              "You cannot put just numbers or special characters in your ";
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  email: Joi.string()
    .email()
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        console.log(err.code);
        switch (err.code) {
          case "any.required":
            err.message = "Oops! email is required";
            break;
          default:
            break;
        }
        switch (err.code) {
          case "string.base":
            err.message =
              "You cannot put just numbers or special characters in your email";
            break;
          case "string.email":
            err.message = "Oops! your email looks invalid";
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  location: Joi.object({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array().items(Joi.number()),
  }),
});
