// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  FALLBACK_VERSIONS,
  TARGET_PACKAGES,
} from "@/lib/compiler/fallback-versions";

vi.mock("next/headers", () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn((name: string) => {
        if (name === "x-forwarded-for") return "127.0.0.1";
        return null;
      }),
    })
  ),
}));

vi.mock("@/lib/rate-limit", () => ({
  ratelimit: null,
}));

import { GET } from "./route";

describe("GET /api/dependencies/versions", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns versions for all TARGET_PACKAGES when fetch succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ "dist-tags": { latest: "1.0.0" } }),
      })
    );

    const response = await GET();
    const json = await response.json();

    for (const pkg of TARGET_PACKAGES) {
      expect(json.versions[pkg]).toBe("1.0.0");
    }
  });

  it("sets usedFallback=false when all fetches succeed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ "dist-tags": { latest: "2.0.0" } }),
      })
    );

    const response = await GET();
    const json = await response.json();

    expect(json.usedFallback).toBe(false);
  });

  it("uses FALLBACK_VERSIONS for failed packages", async () => {
    const failPkg = TARGET_PACKAGES[0];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes(failPkg)) {
          return Promise.reject(new Error("network error"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ "dist-tags": { latest: "3.0.0" } }),
        });
      })
    );

    const response = await GET();
    const json = await response.json();

    expect(json.versions[failPkg]).toBe(FALLBACK_VERSIONS[failPkg]);
  });

  it("sets usedFallback=true when any fetch fails", async () => {
    const failPkg = TARGET_PACKAGES[0];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes(failPkg)) {
          return Promise.reject(new Error("network error"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ "dist-tags": { latest: "3.0.0" } }),
        });
      })
    );

    const response = await GET();
    const json = await response.json();

    expect(json.usedFallback).toBe(true);
  });

  it("fills all TARGET_PACKAGES keys in response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ "dist-tags": { latest: "1.0.0" } }),
      })
    );

    const response = await GET();
    const json = await response.json();

    const keys = Object.keys(json.versions).sort();
    expect(keys).toEqual([...TARGET_PACKAGES].sort());
  });

  it("handles all packages failing by using all fallback versions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("total failure"))
    );

    const response = await GET();
    const json = await response.json();

    expect(json.usedFallback).toBe(true);
    for (const pkg of TARGET_PACKAGES) {
      expect(json.versions[pkg]).toBe(FALLBACK_VERSIONS[pkg]);
    }
  });

  it("returns 429 when rate limit is exceeded", async () => {
    // Override the ratelimit mock for this test
    const ratelimitModule = await import("@/lib/rate-limit");
    const mockLimit = vi.fn().mockResolvedValue({
      success: false,
      limit: 100,
      remaining: 0,
      reset: 1234,
    });
    (ratelimitModule as Record<string, unknown>).ratelimit = { limit: mockLimit };

    const response = await GET();

    expect(response.status).toBe(429);
    const json = await response.json();
    expect(json).toEqual({ error: "Too many requests" });
    expect(response.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("X-RateLimit-Reset")).toBe("1234");

    // Restore ratelimit to null for other tests
    (ratelimitModule as Record<string, unknown>).ratelimit = null;
  });

  it("skips rate limiting when ratelimit is null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ "dist-tags": { latest: "5.0.0" } }),
      })
    );

    const response = await GET();

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.versions).toBeDefined();
    expect(json.usedFallback).toBe(false);
  });
});
