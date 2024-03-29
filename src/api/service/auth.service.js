const redisClient = require("../../config/redis.db");

const { generateTokens } = require("../../lib/authenticator/functions");

const { User } = require("../model/mongodb/user.model");

exports.createUser = async (user_data) => {
  try {
    const user = new User(user_data);

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    await redisClient.set(user.id.toString(), refreshToken, {
      EX: 15 * 60, // Set an expiry, e.g., 15 mins in seconds
      NX: true, // Set only if the key does not exist
    });

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

exports.refreshToken = async (userId, refreshToken) => {
  try {
    const storedToken = await redisClient.get(userId.toString());
    if (!storedToken || storedToken !== refreshToken) {
      throw { message: "Token invalid or expired" };
    }

    const user = { id: userId }; // Fetch user details as needed
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Optionally, update the refresh token in Redis
    await redisClient.set(userId.toString(), newRefreshToken, {
      EX: 15 * 60, // Set an expiry, e.g., 15 mins in seconds
    });

    return { user, accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw error;
  }
};
