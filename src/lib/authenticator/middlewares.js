const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Get the token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token is invalid or expired

    req.user = user; // Attach the user payload to the request
    next(); // Continue to the next middleware or route handler
  });
};
module.exports = { authenticateToken };
