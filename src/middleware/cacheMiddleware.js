import { ensureRedis, redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";

const CACHE_PREFIX = "cache:";
const defaultTtlSeconds = Number(process.env.REDIS_CACHE_TTL_SECONDS) || 60;

const buildCacheKey = (key) => `${CACHE_PREFIX}${key}`;

const cacheMiddleware =
  (keyBuilder, ttlSeconds = defaultTtlSeconds) =>
  async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const redisReady = await ensureRedis();
    if (!redisReady) {
      return next();
    }

    const rawKey =
      typeof keyBuilder === "function" ? keyBuilder(req) : req.originalUrl;
    const cacheKey = buildCacheKey(rawKey);

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.set("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      logger.warn({ err, cacheKey }, "Cache read failed");
    }

    // This is called response interception.

    // Benefits:

    // Automatic caching

    // No change needed in controllers

    // Faster API responses

    // Reduced database load

    // This pattern is common in high-performance Node.js APIs.
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 400) {
        redis.setEx(cacheKey, ttlSeconds, JSON.stringify(body)).catch((err) => {
          logger.warn({ err, cacheKey }, "Cache write failed");
        });
      }
      res.set("X-Cache", "MISS");
      return originalJson(body);
    };

    return next();
  };

// const invalidateCache = async (key) => {
//   const redisReady = await ensureRedis();
//   if (!redisReady) {
//     return false;
//   }
//   const cacheKey = buildCacheKey(key);
//   await redis.del(cacheKey);
//   return true;
// };

const invalidateCache = (keyFn) => {
  return async (req, res, next) => {
    try {
      const redisReady = await ensureRedis();
      if (!redisReady) {
        return next();
      }

      const key = typeof keyFn === "function" ? keyFn(req) : keyFn;
      const cacheKey = buildCacheKey(key);

      await redis.del(cacheKey);

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { cacheMiddleware, invalidateCache, buildCacheKey };
