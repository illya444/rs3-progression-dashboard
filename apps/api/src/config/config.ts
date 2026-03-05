import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  redisUrl: process.env.REDIS_URL,
  logLevel: process.env.LOG_LEVEL ?? "info",
  cacheTtlSeconds: process.env.CACHE_TTL_SECONDS ? Number(process.env.CACHE_TTL_SECONDS) : 60,
  upstreamTimeoutMs: process.env.UPSTREAM_TIMEOUT_MS ? Number(process.env.UPSTREAM_TIMEOUT_MS) : 10000,
  upstream: {
    ge: process.env.GE_UPSTREAM_URL ?? "https://api.weirdgloop.org/exchange",
    merchant: process.env.MERCHANT_UPSTREAM_URL ?? "https://api.weirdgloop.org/merchant",
    vos: process.env.VOS_UPSTREAM_URL ?? "https://api.weirdgloop.org/vos"
  }
};
