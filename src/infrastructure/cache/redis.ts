import Redis from "ioredis";
import { resolveRedisUrl } from "@/shared/config/connections";

let redis: Redis | undefined;

export function getRedis() {
  if (!redis) redis = new Redis(resolveRedisUrl(), { lazyConnect: true });
  return redis;
}
