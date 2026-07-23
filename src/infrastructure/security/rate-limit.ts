import { getRedis } from "@/infrastructure/cache/redis";

export async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const redis = getRedis();
  if (redis.status === "wait") await redis.connect();
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  const ttl = await redis.ttl(key);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfter: Math.max(0, ttl) };
}
