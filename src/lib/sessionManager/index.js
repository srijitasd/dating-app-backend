const redisClient = require("../../config/redis.db");

const { sessionKey } = require("../../constants/redis/naming_convention.redis");

/**
 * Save session to Redis cache
 */
async function cacheSession(userId, jti, sessionData, ttl = 15 * 60) {
  // sessionData should be a JSON object containing refreshToken and metadata
  await redisClient.set(
    sessionKey(userId, jti),
    JSON.stringify(sessionData),
    "EX",
    ttl
  );
}

/**
 * Get session from Redis cache
 */
async function getCachedSession(userId, jti) {
  const data = await redisClient.get(sessionKey(userId, jti));
  return data ? JSON.parse(data) : null;
}

/**
 * Remove session from Redis cache
 */
async function removeCachedSession(userId, jti) {
  await redisClient.del(sessionKey(userId, jti));
}

module.exports = {
  cacheSession,
  getCachedSession,
  removeCachedSession,
};
