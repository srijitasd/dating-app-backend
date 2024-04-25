const Router = require("express").Router();

const { authenticateToken } = require("../../lib/authenticator/middlewares");
const {
  swipeController,
  nearByUsersController,
} = require("../controller/matcher.controller");

Router.post("/swipe", authenticateToken, swipeController);
Router.get("/user/nearby", authenticateToken, nearByUsersController);

module.exports = Router;
