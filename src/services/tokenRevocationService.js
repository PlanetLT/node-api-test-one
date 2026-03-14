import { ensureRedis, redis } from "../config/redis.js";
import { hashToken } from "../utils/tokenService.js";
import { securityLogger } from "../utils/logger.js";

const buildRevokedAccessKey = (token) =>
  `revoked:access:${hashToken(token)}`;

const getAccessTokenTtlSeconds = (decoded) => {
  if (decoded?.exp) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return Math.max(decoded.exp - nowSeconds, 0);
  }

  const fallbackMs =
    Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 15 * 60 * 1000;
  return Math.ceil(fallbackMs / 1000);
};

const revokeAccessToken = async ({ token, decoded }) => {
  if (!token) {
    return false;
  }

  const ttlSeconds = getAccessTokenTtlSeconds(decoded);
  if (ttlSeconds <= 0) {
    return false;
  }

  const redisReady = await ensureRedis();
  if (!redisReady) {
    return false;
  }

  const cacheKey = buildRevokedAccessKey(token);
  try {
    await redis.setEx(cacheKey, ttlSeconds, "1");
    return true;
  } catch (err) {
    securityLogger.warn({ err }, "Failed to revoke access token");
    return false;
  }
};

const isAccessTokenRevoked = async (token) => {
  if (!token) {
    return false;
  }

  const redisReady = await ensureRedis();
  if (!redisReady) {
    return false;
  }

  const cacheKey = buildRevokedAccessKey(token);
  try {
    const isRevoked = await redis.exists(cacheKey);
    return Boolean(isRevoked);
  } catch (err) {
    securityLogger.warn({ err }, "Failed to check access token revocation");
    return false;
  }
};

export { revokeAccessToken, isAccessTokenRevoked };
