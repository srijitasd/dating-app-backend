const jwt = require("jsonwebtoken");

function generateTokens(user, jti) {
  const userPayload = { id: user._id, email: user.email }; // Customize payload as needed
  const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFE,
  });
  const refreshToken = jwt.sign(
    { ...userPayload, jti },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_LIFE,
    }
  );

  return { accessToken, refreshToken };
}

function generateEmailVerificationToken(userId, email) {
  return jwt.sign(
    {
      userId,
      email,
      purpose: "email_verification",
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = {
  generateTokens,
  generateEmailVerificationToken,
  verifyRefreshToken,
};
