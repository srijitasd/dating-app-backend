const jwt = require("jsonwebtoken");

function generateTokens(user) {
  const userPayload = { id: user._id, email: user.email }; // Customize payload as needed
  const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFE,
  });
  const refreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_LIFE,
  });

  return { accessToken, refreshToken };
}
module.exports = { generateTokens };
