const {
  registerUserSchema,
  verifyEmailSchema,
} = require("../model/requestSchema/user.schema");

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
      req.body,
      { device: req.headers["user-agent"], ip: req.ip }
    );

    const mailOptions = {
      from: "The Idea project",
      to: req.body.email,
      subject: "Welcome to Dating App!",
      html: welcome_body(req.body),
    };

    await sendEmail(mailOptions);

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
      req.body,
      { device: req.headers["user-agent"], ip: req.ip }
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

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    } = await UserService.refreshToken(refreshToken);

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
    const { jti = undefined } = req.body; // If you want to logout from a specific session

    await UserService.logoutUser(id, jti);

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

exports.sendEmailVerification = async (req, res) => {
  try {
    const token = await UserService.generateEmailVerification(req.user.id);

    const mailOptions = {
      from: "The Idea project",
      to: req.user.email,
      subject: "Verify Your Email",
      html: `Click here to verify your email: ${process.env.APP_URL}/verify-email/${token}`,
    };

    await sendEmail(mailOptions);

    handleResponse({
      payload: {
        status: 200,
        code: "AUTH_S006",
        message: "Verification email sent successfully",
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

exports.verifyEmail = async (req, res) => {
  try {
    await verifyEmailSchema.validateAsync(req.body);
    const user = await UserService.verifyEmail(req.body.token);

    handleResponse({
      payload: {
        status: 200,
        code: "AUTH_S007",
        data: { email_verified: user.email_verified },
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
