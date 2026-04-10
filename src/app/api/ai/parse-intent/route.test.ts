// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock state ---

const mockIntentOutput = {
  customerName: "Acme Corp",
  industry: "E-commerce / Retail" as const,
  persona: "CMO" as const,
  architecture: {
    enableSESidebar: true,
    enableSeededProfiles: true,
    enableProfileAPI: false,
    enableIntentPredictions: false,
    enableSecondPagePers: false,
  },
  suggestedScenarios: ["second-page-personalization"],
};

const { mockAuthResult, mockLimit, mockGenerateText } = vi.hoisted(() => ({
  mockAuthResult: { current: { userId: "user_test", error: null } as { userId: string; error: null } | { userId: null; error: string } },
  mockLimit: vi.fn(() => Promise.resolve({ success: true })),
  mockGenerateText: vi.fn(() => Promise.resolve({ output: null })),
}));

// --- Mocks ---

vi.mock("@/lib/ai/auth", () => ({
  requireAuthForAI: vi.fn(() => Promise.resolve(mockAuthResult.current)),
}));

vi.mock("@/lib/ai/rate-limit", () => ({
  aiGenerateRatelimit: { limit: mockLimit },
}));

vi.mock("ai", () => ({
  generateText: mockGenerateText,
  Output: { object: vi.fn(({ schema }: { schema: unknown }) => schema) },
}));

vi.mock("@/lib/ai/config", () => ({
  MODELS: { chat: "mock-chat-model", fast: "mock-fast-model" },
}));

vi.mock("@/lib/ai/system-prompts", () => ({
  buildParseIntentSystemPrompt: vi.fn(() => "mock-parse-prompt"),
}));

// --- Import after mocks ---

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/parse-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// --- Tests ---

describe("POST /api/ai/parse-intent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthResult.current = { userId: "user_test", error: null };
    mockLimit.mockResolvedValue({ success: true });
    mockGenerateText.mockResolvedValue({ output: mockIntentOutput });
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthResult.current = { userId: null, error: "Not authenticated" };
    const res = await POST(makeRequest({ description: "Build a demo" }));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockLimit.mockResolvedValueOnce({ success: false });
    const res = await POST(makeRequest({ description: "Build a demo" }));
    expect(res.status).toBe(429);
  });

  it("returns 400 when description is empty", async () => {
    const res = await POST(makeRequest({ description: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when description exceeds 2000 chars", async () => {
    const res = await POST(makeRequest({ description: "a".repeat(2001) }));
    expect(res.status).toBe(400);
  });

  it("returns structured intent on valid input", async () => {
    const res = await POST(
      makeRequest({ description: "Build a retail demo for a CMO" })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.customerName).toBe("Acme Corp");
    expect(json.industry).toBe("E-commerce / Retail");
    expect(json.persona).toBe("CMO");
  });

  it("returns 502 when output is null", async () => {
    mockGenerateText.mockResolvedValueOnce({ output: null });
    const res = await POST(makeRequest({ description: "Build a demo" }));
    expect(res.status).toBe(502);
  });
});
