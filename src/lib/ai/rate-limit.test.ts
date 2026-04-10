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

describe("ai/rate-limit", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("both exports are null when neither env var is set", async () => {
    const { aiChatRatelimit, aiGenerateRatelimit } = await import(
      "./rate-limit"
    );
    expect(aiChatRatelimit).toBeNull();
    expect(aiGenerateRatelimit).toBeNull();
  });

  it("returns null when UPSTASH_REDIS_REST_URL is missing", async () => {
    process.env.UPSTASH_REDIS_REST_TOKEN = "token-123";
    const { aiChatRatelimit, aiGenerateRatelimit } = await import(
      "./rate-limit"
    );
    expect(aiChatRatelimit).toBeNull();
    expect(aiGenerateRatelimit).toBeNull();
  });

  it("returns null when UPSTASH_REDIS_REST_TOKEN is missing", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    const { aiChatRatelimit, aiGenerateRatelimit } = await import(
      "./rate-limit"
    );
    expect(aiChatRatelimit).toBeNull();
    expect(aiGenerateRatelimit).toBeNull();
  });

  it("aiChatRatelimit is a Ratelimit instance when both env vars present", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token-123";
    const { aiChatRatelimit } = await import("./rate-limit");
    expect(aiChatRatelimit).not.toBeNull();
  });

  it("aiGenerateRatelimit is a Ratelimit instance when both env vars present", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token-123";
    const { aiGenerateRatelimit } = await import("./rate-limit");
    expect(aiGenerateRatelimit).not.toBeNull();
  });
});
