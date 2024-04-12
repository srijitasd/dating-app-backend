const { registerUserSchema } = require("../model/requestSchema/user.schema");

const UserService = require("../service/auth.service");

const { sendEmail } = require("../../utils/mailer/mailer");

const {
  welcome_body,
  signin_otp,
} = require("../../constants/emailTemplates/functions");
const { handleResponse } = require("../../utils/response_generator/functions");

exports.registerUser = async (req, res) => {
  try {
    await registerUserSchema.validateAsync(req.body);

    const { user, accessToken, refreshToken } = await UserService.createUser(
      req.body
    );

    const mailOptions = {
      from: "The Idea project",
      to: req.body.email,
      subject: "Welcome to Dating App!",
      html: welcome_body(req.body),
    };

    await sendEmail(mailOptions);

    res.status(201).json({ user, accessToken, refreshToken });

    handleResponse({
      payload: {
        status: 201,
        code: "AUTH_S001",
        data: { user, accessToken, refreshToken },
      },
      handler: "AUTH_CODES_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    console.log(error);
    handleResponse({
      payload: error,
      handler: "AUTH_CODES_HANDLER",
      success: false,
      req,
      res,
    });
  }
};

exports.getSigninOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const { user, otp } = await UserService.getSigninOTP(email);

    const mailOptions = {
      from: "The Idea project",
      to: req.body.email,
      subject: "Welcome to Dating App!",
      html: signin_otp({ user, otp }),
    };

    await sendEmail(mailOptions);

    handleResponse({
      payload: {
        status: 200,
        code: "AUTH_S002",
      },
      handler: "AUTH_CODES_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    console.log(error);
    handleResponse({
      payload: error,
      handler: "AUTH_CODES_HANDLER",
      success: false,
      req,
      res,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await UserService.verifyOTP(
      req.body
    );

    handleResponse({
      payload: {
        status: 200,
        code: "AUTH_S003",
        data: { user, accessToken, refreshToken },
      },
      handler: "AUTH_CODES_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    handleResponse({
      payload: error,
      handler: "AUTH_CODES_HANDLER",
      success: false,
      req,
      res,
    });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  const { id } = req.user;
  try {
    const {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    } = await UserService.refreshToken(id, refreshToken);

    handleResponse({
      payload: {
        status: 200,
        code: "AUTH_S004",
        data: { accessToken, refreshToken: newRefreshToken },
      },
      handler: "AUTH_CODES_HANDLER",
      success: true,
      req,
      res,
    });
  } catch (error) {
    console.log(error);
    handleResponse({
      payload: error,
      handler: "AUTH_CODES_HANDLER",
      success: false,
      req,
      res,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { id } = req.user;

    await UserService.logoutUser(id);

    handleResponse({
      payload: {
        status: 200,
        code: "AUTH_S005",
      },
      handler: "AUTH_CODES_HANDLER",
      success: true,
      req,
      res,
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    handleResponse({
      payload: error,
      handler: "AUTH_CODES_HANDLER",
      success: false,
      req,
      res,
    });
  }
};
