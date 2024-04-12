const { registerUserSchema } = require("../model/requestSchema/user.schema");

const UserService = require("../service/auth.service");

const { sendEmail } = require("../../utils/mailer/mailer");

const {
  welcome_body,
  signin_otp,
} = require("../../constants/emailTemplates/functions");

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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.authenticateUser(email, password);
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refreshToken in Redis with the user ID as the key
    await redisClient.set(user.id.toString(), refreshToken, {
      EX: 15 * 60, // Set an expiry, e.g., 15 mins in seconds
      NX: true, // Set only if the key does not exist
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
