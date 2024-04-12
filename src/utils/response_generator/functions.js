const messageCode = require("../../constants/response/index");

const getMessage = (handler, locale = "en", code) => {
  return messageCode[handler][locale][code];
};

const getErrorStatusCode = (error) => {
  if (error.isJoi) return 400; // Joi validation error
  if (error.name === "ValidationError") return 400; // Mongoose validation error
  if (error.name === "CastError") return 400; // Mongoose cast error (invalid ObjectId, etc.)
  if (error.userThrown) return error.statusCode || 400; // User-thrown error with custom status
  return 500; // Default to internal server error for unexpected errors
};

const getErrorMessage = (req, error, handler) => {
  if (error.isJoi) {
    let errorMessage = [];
    for (const err of error.details) {
      errorMessage.push(err.message);
    }

    return {
      message: errorMessage.join(", "),
      code: messageCode.ERROR_CODE_HANDLER.GLOBAL_E001,
    };
  }
  if (error.name === "ValidationError") {
    return {
      message: Object.values(error.errors)
        .map((err) => err.message)
        .join(", "),
      code: messageCode.ERROR_CODE_HANDLER.GLOBAL_E002,
    };
  }
  if (error.name === "MongoServerError") {
    switch (error.code) {
      case 11000:
        return {
          message: `A duplicate value was provided for ${
            Object.keys(error.keyPattern)[0]
          }, it must be unique.`,
          code: messageCode.ERROR_CODE_HANDLER.GLOBAL_E005,
        };
      // Add cases for other specific MongoDB error codes as needed
      default:
        return "A database error occurred.";
    }
  }
  if (error.name === "CastError") {
    return {
      message: `Invalid ${error.path}: ${error.value}.`,
      code: messageCode.ERROR_CODE_HANDLER.GLOBAL_E003,
    };
  }
  if (error.userThrown) {
    if (validator.isString(error)) {
      return error;
    } else {
      return {
        message: getMessage(handler, req.headers.locale, error.code),
        code: error.code ? error.code : "",
        ...(error.data ? { data: error.data } : {}),
      };
    }
  }
  return {
    message: "An unexpected error occurred",
    code: messageCode.ERROR_CODE_HANDLER.GLOBAL_E004,
  }; // Generic message for unexpected errors
};

const getSuccessMessage = (req, payload, handler) => {
  return {
    message: getMessage(handler, req.headers.locale, payload.code),
    code: payload.code ? payload.code : "",
    ...(payload.data ? { data: payload.data } : {}),
  };
};

exports.handleResponse = ({ payload, handler, success = false, req, res }) => {
  if (!success) {
    const statusCode = getErrorStatusCode(payload);
    const error = getErrorMessage(req, payload, handler);

    res.status(statusCode).json({
      status: "error",
      error,
    });

    return;
  } else {
    const success = getSuccessMessage(req, payload, handler);

    res.status(payload.status).json({
      status: "success",
      success,
    });
  }
};
