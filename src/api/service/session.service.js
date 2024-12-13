const { v4: uuidv4 } = require("uuid");

const Session = require("../model/mongodb/session.model");

const {
  cacheSession,
  getCachedSession,
  removeCachedSession,
} = require("../../lib/sessionManager");

const {
  generateTokens,
  verifyRefreshToken,
} = require("../../lib/authenticator/functions");

/**
 * Create a new session and store in both DB and Redis.
 */
async function createSession(user, jti, refreshToken, metadata = {}) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const sessionData = {
    userId: user._id,
    jti,
    refreshToken,
    device: metadata.device || "unknown",
    ip: metadata.ip || "0.0.0.0",
    expiresAt,
  };

  // Save in DB
  const session = new Session(sessionData);
  await session.save();

  // Cache in Redis
  await cacheSession(user._id.toString(), jti, {
    refreshToken: refreshToken,
    device: sessionData.device,
    ip: sessionData.ip,
    createdAt: Date.now(),
    expiresAt: expiresAt.toISOString(),
  });

  return { jti, refreshToken };
}

/**
 * Validate a given refresh token.
 * Checks Redis first, then fallback on DB.
 */
async function validateSession(userId, providedRefreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(providedRefreshToken);
  } catch (error) {
    throw { message: "Invalid refresh token", error };
  }

  const { jti } = payload;

  // Try Redis first
  let sessionData = await getCachedSession(userId, jti);
  console.log(sessionData);

  if (!sessionData) {
    // Not in Redis, check DB
    const session = await Session.findOne({ userId, jti });
    if (!session || session.refreshToken !== providedRefreshToken) {
      throw { message: "Session not found or token mismatch" };
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      await destroySession(userId, jti); // cleanup
      throw { message: "Session expired" };
    }

    // Re-cache the session
    await cacheSession(userId, jti, {
      refreshToken: session.refreshToken,
      device: session.device,
      ip: session.ip,
      createdAt: session.createdAt.getTime(),
      expiresAt: session.expiresAt.toISOString(),
    });

    sessionData = {
      refreshToken: session.refreshToken,
      device: session.device,
      ip: session.ip,
      createdAt: session.createdAt.getTime(),
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  // Validate provided refreshToken
  if (sessionData.refreshToken !== providedRefreshToken) {
    throw { message: "Invalid refresh token in cache" };
  }

  // Check expiration from cached data
  if (new Date(sessionData.expiresAt) < new Date()) {
    await destroySession(userId, jti);
    throw { message: "Session expired" };
  }

  return { payload, sessionData };
}

/**
 * Destroy a session (logout from a single device)
 */
async function destroySession(userId, jti) {
  await removeCachedSession(userId, jti);
  await Session.deleteOne({ userId, jti });
}

/**
 * Destroy all sessions for a user (logout from all devices)
 */
async function destroyAllSessions(userId) {
  // In a real-world scenario, you would:
  // 1. Query all sessions from DB by userId
  // 2. For each session, remove from Redis
  // 3. Delete all from DB

  const sessions = await Session.find({ userId });
  for (const s of sessions) {
    await removeCachedSession(userId, s.jti);
  }
  await Session.deleteMany({ userId });
}

/**
 * Refresh token logic: validate current session, rotate tokens.
 */
async function refreshSession(userId, oldRefreshToken) {
  const { payload } = await validateSession(userId, oldRefreshToken);
  const { jti: oldJti } = payload;

  // Generate new tokens
  const user = { _id: userId, email: payload.email };
  const jti = uuidv4();
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user,
    jti
  );

  // Update DB and Redis to remove old session and create a new one
  await destroySession(userId, oldJti);
  await createSession(user, jti, newRefreshToken, {
    device: "sameDevice",
    ip: "0.0.0.0",
  });

  return { user, accessToken, refreshToken: newRefreshToken };
}

module.exports = {
  createSession,
  validateSession,
  destroySession,
  destroyAllSessions,
  refreshSession,
};
