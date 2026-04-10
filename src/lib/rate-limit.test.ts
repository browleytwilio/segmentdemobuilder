// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/ratelimit", () => {
  const MockRatelimit = vi.fn();
  MockRatelimit.slidingWindow = vi.fn().mockReturnValue("sliding-window-limiter");
  return { Ratelimit: MockRatelimit };
});

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(),
}));

describe("ratelimit", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("returns null when UPSTASH_REDIS_REST_URL is missing", async () => {
    process.env.UPSTASH_REDIS_REST_TOKEN = "token-123";
    const { ratelimit } = await import("./rate-limit");
    expect(ratelimit).toBeNull();
  });

  it("returns null when UPSTASH_REDIS_REST_TOKEN is missing", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    const { ratelimit } = await import("./rate-limit");
    expect(ratelimit).toBeNull();
  });

  it("returns a Ratelimit instance when both env vars are present", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token-123";
    const { ratelimit } = await import("./rate-limit");
    expect(ratelimit).not.toBeNull();
  });
});
