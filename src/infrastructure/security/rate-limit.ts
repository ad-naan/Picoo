import { getRedis } from "@/infrastructure/cache/redis";

type MemoryEntry = { count: number; resetAt: number };
const memoryLimits = new Map<string, MemoryEntry>();

function consumeMemoryLimit(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  let entry = memoryLimits.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowSeconds * 1000 };
    memoryLimits.set(key, entry);
  }
  entry.count += 1;
  const retryAfter = Math.max(0, Math.ceil((entry.resetAt - now) / 1000));
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count), retryAfter, degraded: true };
}

export async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  try {
    const redis = getRedis();
    if (redis.status === "wait") await redis.connect();
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    const ttl = await redis.ttl(key);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfter: Math.max(0, ttl), degraded: false };
  } catch {
    return consumeMemoryLimit(key, limit, windowSeconds);
  }
}
