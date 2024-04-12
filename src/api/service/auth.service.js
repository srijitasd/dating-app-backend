const redisClient = require("../../config/redis.db");
const {
  session_store,
  signin_otp_store,
} = require("../../constants/redis/naming_convention.redis");

const { generateTokens } = require("../../lib/authenticator/functions");
const { generate_otp } = require("../../lib/otp_generator/functions");

const { User } = require("../model/mongodb/user.model");

exports.createUser = async (user_data) => {
  try {
    const user = new User(user_data);

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    await redisClient.set(session_store(user._id.toString()), refreshToken, {
      EX: 15 * 60, // Set an expiry, e.g., 15 mins in seconds
      NX: true, // Set only if the key does not exist
    });

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

exports.getSigninOTP = async (user_data) => {
  try {
    const doesUserExists = await User.findOne({
      email: user_data.email,
    }).select("name email");
    if (!doesUserExists) {
      throw {
        message: "user not found!",
      };
    }

    const OTP = generate_otp();

    await redisClient.set(
      signin_otp_store(doesUserExists._id.toString()),
      OTP,
      {
        EX: 1 * 60, // Set an expiry, e.g., 15 mins in seconds
        NX: true, // Set only if the key does not exist
      }
    );

    return { user: doesUserExists, otp: OTP };
  } catch (error) {
    throw error;
  }
};

exports.verifyOTP = async (user_data) => {
  try {
    // Retrieve OTP from Redis
    const storedOTP = await redisClient.get(signin_otp_store(user_data.email));
    if (!storedOTP || storedOTP !== user_data.otp) {
      throw { message: "OTP expired" };
    }

    const doesUserExists = await User.findOne({
      email: user_data.email,
    }).select("name email");
    if (!doesUserExists) {
      throw {
        message: "user not found!",
      };
    }

    const { accessToken, refreshToken } = generateTokens(doesUserExists);

    await redisClient.del(signin_otp_store(user_data.email));

    await redisClient.set(
      session_store(doesUserExists._id.toString()),
      refreshToken,
      {
        EX: 15 * 60, // Set an expiry, e.g., 15 mins in seconds
        NX: true, // Set only if the key does not exist
      }
    );

    return { user: doesUserExists, accessToken, refreshToken };
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
