const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const redisClient = require("../../config/redis.db");

const {
  session_store,
  signin_otp_store,
  email_verification_store,
} = require("../../constants/redis/naming_convention.redis");

const {
  generateTokens,
  generateEmailVerificationToken,
  verifyRefreshToken,
} = require("../../lib/authenticator/functions");
const { generate_otp } = require("../../lib/otp_generator/functions");

const { User } = require("../model/mongodb/user.model");
const {
  createSession,
  refreshSession,
  destroySession,
  destroyAllSessions,
} = require("./session.service");

exports.createUser = async (user_data, metadata) => {
  try {
    const user = new User(user_data);

    await user.save();

    // const { accessToken, refreshToken } = generateTokens(user);
    // await createSession(user, refreshToken, {
    //   device: metadata.device,
    //   ip: metadata.ip,
    // });

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

exports.getSigninOTP = async (email) => {
  try {
    const doesUserExists = await User.findOne({
      email: email,
    }).select("name email");
    if (!doesUserExists) {
      throw {
        userThrow: true,
        message: "user not found!",
      };
    }

    const OTP = generate_otp();

    await redisClient.set(
      signin_otp_store(doesUserExists._id.toString()),
      OTP,
      "EX",
      1 * 60,
      "NX"
    );

    return { user: doesUserExists, otp: OTP };
  } catch (error) {
    throw error;
  }
};

exports.verifyOTP = async (user_data, metadata) => {
  try {
    const user = await User.findOne({
      email: user_data.email,
    }).select("name email");
    if (!user) {
      throw {
        userThrow: true,
        message: "user not found!",
      };
    }

    const storedOTP = await redisClient.get(signin_otp_store(user._id));

    if (!storedOTP || storedOTP !== user_data.otp) {
      throw { userThrow: true, message: "OTP expired" };
    }

    await redisClient.del(signin_otp_store(user_data.email));

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await createSession(user, jti, refreshToken, {
      device: metadata.device,
      ip: metadata.ip,
    });

    await redisClient.del(signin_otp_store(user._id));

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

exports.refreshToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw {
        userThrow: true,
        message: "user not found!",
      };
    }

    const doesUserExists = await User.findById(decoded.id).select("name email");
    if (!doesUserExists) {
      throw {
        userThrow: true,
        message: "user not found!",
      };
    }

    const {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } = await refreshSession(doesUserExists._id, refreshToken);

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw error;
  }
};

exports.logoutUser = async (userId, jti = undefined) => {
  try {
    if (jti) {
      await destroySession(userId, jti);
    } else {
      await destroyAllSessions(userId);
    }
  } catch (error) {
    throw error;
  }
};

exports.generateEmailVerification = async (userId, email) => {
  try {
    const verificationToken = generateEmailVerificationToken(userId, email);

    await redisClient.set(email_verification_store(userId), verificationToken, {
      EX: 24 * 60 * 60, // 24 hours in seconds
      NX: true,
    });

    return verificationToken;
  } catch (error) {
    throw error;
  }
};

exports.verifyEmail = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "email_verification") {
      throw { message: "Invalid verification token" };
    }

    const storedToken = await redisClient.get(
      email_verification_store(decoded.userId)
    );

    if (!storedToken || storedToken !== token) {
      throw { message: "Token expired or already used" };
    }

    await User.findByIdAndUpdate(decoded.userId, { email_verified: true });
    await redisClient.del(email_verification_store(decoded.userId));

    return { email_verified: true };
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw { message: "Invalid token" };
    }
    if (error.name === "TokenExpiredError") {
      throw { message: "Token has expired" };
    }
    throw error;
  }
};
