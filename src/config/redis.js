import { createClient } from "redis";
import { logger } from "../utils/logger.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connectTimeoutMs =
  Number(process.env.REDIS_CONNECT_TIMEOUT_MS) || 1000;

const redis = createClient({
  url: redisUrl,
  socket: { connectTimeout: connectTimeoutMs },
});

redis.on("ready", () => {
  logger.info({ redisUrl }, "Redis connection ready");
});

redis.on("end", () => {
  logger.warn("Redis connection closed");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis client error");
});

const connectRedis = async () => {
  if (redis.isOpen) {
    return true;
  }
  try {
    await redis.connect();
    return true;
  } catch (err) {
    logger.error({ err }, "Redis connection failed");
    return false;
  }
};

const disconnectRedis = async () => {
  if (!redis.isOpen) {
    return;
  }
  await redis.quit();
};

const ensureRedis = async () => {
  if (redis.isOpen) {
    return true;
  }
  return connectRedis();
};

const isRedisReady = () => redis.isOpen;

export { redis, connectRedis, disconnectRedis, ensureRedis, isRedisReady };
