// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

let mockClerkUserId: string | null = "user_abc123";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => Promise.resolve({ userId: mockClerkUserId })),
}));

import { requireAuthForAI } from "./auth";

describe("requireAuthForAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClerkUserId = "user_abc123";
  });

  it("returns { userId, error: null } when Clerk auth returns a userId", async () => {
    const result = await requireAuthForAI();
    expect(result).toEqual({ userId: "user_abc123", error: null });
  });

  it("returns { userId: null, error } when Clerk auth returns null userId", async () => {
    mockClerkUserId = null;
    const result = await requireAuthForAI();
    expect(result).toEqual({ userId: null, error: "Not authenticated" });
  });

  it("calls Clerk auth() exactly once", async () => {
    const { auth } = await import("@clerk/nextjs/server");
    await requireAuthForAI();
    expect(auth).toHaveBeenCalledTimes(1);
  });
});
