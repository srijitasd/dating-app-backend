const Router = require("express").Router();

const userController = require("../controller/auth.controller");

const { authenticateToken } = require("../../lib/authenticator/middlewares");

Router.post("/register", userController.registerUser);

Router.post("/otp/generate", userController.getSigninOTP);

Router.post("/otp/verify", userController.verifyOTP);

Router.post("/token/refresh", userController.refreshToken);

Router.get("/logout", authenticateToken, userController.logout);

Router.post(
  "/email/verify/send",
  authenticateToken,
  userController.sendEmailVerification
);

Router.post("/email/verify", userController.verifyEmail);

module.exports = Router;
