import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn(
      "[ai/rate-limit] Upstash Redis not configured — AI rate limiting is DISABLED"
    );
    return null;
  }
  return new Redis({ url, token });
}

const redis = createRedis();

export const aiChatRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "ratelimit:ai:chat",
    })
  : null;

export const aiGenerateRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "ratelimit:ai:generate",
    })
  : null;
