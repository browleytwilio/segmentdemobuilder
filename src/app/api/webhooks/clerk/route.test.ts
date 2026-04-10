// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock state ---

const {
  mockVerifyThrows,
  mockVerifyResult,
  mockDeleteUser,
  mockSupaChain,
} = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.from = vi.fn(() => chain);
  chain.select = vi.fn(() => chain);
  chain.insert = vi.fn(() => chain);
  chain.update = vi.fn(() => chain);
  chain.delete = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));

  return {
    mockVerifyThrows: { current: false },
    mockVerifyResult: { current: null as unknown },
    mockDeleteUser: vi.fn(),
    mockSupaChain: chain,
  };
});

// --- Mocks ---
// Use plain functions (not vi.fn()) in factories so vi.restoreAllMocks() from
// vitest.setup.ts doesn't strip their implementations between tests.

vi.mock("svix", () => {
  // Plain constructor function — not a vi.fn(), so restoreAllMocks can't reset it
  function MockWebhook() {
    return {
      verify: (..._args: unknown[]) => {
        if (mockVerifyThrows.current) throw new Error("Invalid signature");
        return mockVerifyResult.current;
      },
    };
  }
  return { Webhook: MockWebhook };
});

vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve(
      new Headers({
        "svix-id": "msg_test",
        "svix-timestamp": "1234567890",
        "svix-signature": "v1,test-sig",
      })
    ),
  cookies: () =>
    Promise.resolve({
      getAll: () => [],
      set: () => {},
      get: () => undefined,
      delete: () => {},
    }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => mockSupaChain,
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: () =>
    Promise.resolve({ users: { deleteUser: mockDeleteUser } }),
}));

// --- Import after mocks ---

import { POST } from "./route";

function makeWebhookRequest(body?: unknown): Request {
  return new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

// --- Tests ---

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyThrows.current = false;
    mockVerifyResult.current = null;

    // Restore the chainable pattern after clearAllMocks
    mockSupaChain.from.mockReturnValue(mockSupaChain);
    mockSupaChain.select.mockReturnValue(mockSupaChain);
    mockSupaChain.insert.mockReturnValue(mockSupaChain);
    mockSupaChain.update.mockReturnValue(mockSupaChain);
    mockSupaChain.delete.mockReturnValue(mockSupaChain);
    mockSupaChain.eq.mockReturnValue(mockSupaChain);
    mockSupaChain.single.mockResolvedValue({ data: null, error: null });
  });

  // --- Signature verification ---

  describe("signature verification", () => {
    it("returns 401 when svix verify throws", async () => {
      mockVerifyThrows.current = true;
      const res = await POST(makeWebhookRequest());
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Invalid signature");
    });
  });

  // --- user.created (Twilio email) ---

  describe("user.created - Twilio email", () => {
    const twilioEvent = {
      type: "user.created",
      data: {
        id: "clerk_abc123",
        email_addresses: [{ id: "ea_1", email_address: "se@twilio.com" }],
        primary_email_address_id: "ea_1",
      },
    };

    it("inserts new profile when no existing profile found", async () => {
      mockVerifyResult.current = twilioEvent;
      mockSupaChain.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" },
      });

      const res = await POST(makeWebhookRequest());
      expect(res.status).toBe(200);
      expect(mockSupaChain.insert).toHaveBeenCalledWith({
        id: "clerk_abc123",
        email: "se@twilio.com",
      });
    });

    it("updates existing profile ID for migration path", async () => {
      mockVerifyResult.current = twilioEvent;
      mockSupaChain.single.mockResolvedValueOnce({
        data: { id: "old-uuid-123" },
        error: null,
      });

      const res = await POST(makeWebhookRequest());
      expect(res.status).toBe(200);
      expect(mockSupaChain.update).toHaveBeenCalledWith({
        id: "clerk_abc123",
      });
    });

    it("returns { received: true }", async () => {
      mockVerifyResult.current = twilioEvent;
      mockSupaChain.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" },
      });

      const res = await POST(makeWebhookRequest());
      const json = await res.json();
      expect(json.received).toBe(true);
    });
  });

  // --- user.created (non-Twilio email) ---

  describe("user.created - non-Twilio email", () => {
    it("deletes user from Clerk and rejects", async () => {
      mockVerifyResult.current = {
        type: "user.created",
        data: {
          id: "clerk_bad",
          email_addresses: [
            { id: "ea_1", email_address: "hacker@evil.com" },
          ],
          primary_email_address_id: "ea_1",
        },
      };

      const res = await POST(makeWebhookRequest());
      expect(mockDeleteUser).toHaveBeenCalledWith("clerk_bad");
      const json = await res.json();
      expect(json.rejected).toBe("domain_not_allowed");
    });
  });

  // --- user.updated ---

  describe("user.updated", () => {
    it("updates profile email in Supabase", async () => {
      mockVerifyResult.current = {
        type: "user.updated",
        data: {
          id: "clerk_abc123",
          email_addresses: [
            { id: "ea_1", email_address: "newemail@twilio.com" },
          ],
          primary_email_address_id: "ea_1",
        },
      };

      const res = await POST(makeWebhookRequest());
      expect(res.status).toBe(200);
      expect(mockSupaChain.update).toHaveBeenCalledWith({
        email: "newemail@twilio.com",
      });
    });
  });

  // --- user.deleted ---

  describe("user.deleted", () => {
    it("deletes profile from Supabase", async () => {
      mockVerifyResult.current = {
        type: "user.deleted",
        data: { id: "clerk_abc123" },
      };

      const res = await POST(makeWebhookRequest());
      expect(res.status).toBe(200);
      expect(mockSupaChain.delete).toHaveBeenCalled();
      expect(mockSupaChain.eq).toHaveBeenCalledWith("id", "clerk_abc123");
    });

    it("does not delete when clerkId is undefined", async () => {
      mockVerifyResult.current = {
        type: "user.deleted",
        data: { id: undefined },
      };

      const res = await POST(makeWebhookRequest());
      expect(res.status).toBe(200);
      expect(mockSupaChain.delete).not.toHaveBeenCalled();
    });
  });
});
