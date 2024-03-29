const Router = require("express").Router();

const userController = require("../controller/auth.controller");

const { authenticateToken } = require("../../lib/authenticator/middlewares");

Router.post("/register", userController.registerUser);

Router.post("/token/refresh", authenticateToken, userController.refreshToken);

Router.post("/logout", userController.logout);

Router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "You're accessing a protected route!", user: req.user });
});

module.exports = Router;
