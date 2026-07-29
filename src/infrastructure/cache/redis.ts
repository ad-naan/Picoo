import Redis from "ioredis";
import { resolveRedisUrl } from "@/shared/config/connections";

let redis: Redis | undefined;

export function getRedis() {
  if (!redis) {
    redis = new Redis(resolveRedisUrl(), { lazyConnect: true, connectTimeout: 2_000, maxRetriesPerRequest: 1, enableOfflineQueue: false });
    redis.on("error", () => undefined);
  }
  return redis;
}
