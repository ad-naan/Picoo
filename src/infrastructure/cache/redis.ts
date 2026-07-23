import Redis from "ioredis";

let redis: Redis | undefined;

export function getRedis() {
  if (!redis) redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { lazyConnect: true });
  return redis;
}
