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
  const { userId, refreshToken } = req.body;
  try {
    const {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    } = await UserService.refreshToken(userId, refreshToken);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  const { userId } = req.body;
  try {
    // Remove the user's refresh token to effectively log them out
    await redisClient.del(userId.toString());
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
