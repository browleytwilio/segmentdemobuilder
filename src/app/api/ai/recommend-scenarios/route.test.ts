// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock state ---

const mockOutput = {
  recommendations: [
    { scenarioSlug: "second-page-personalization", reasoning: "High impact for CMO", impactScore: 9 },
  ],
  summary: "Recommended 1 scenario",
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
  buildRecommendationSystemPrompt: vi.fn(() => "mock-recommend-prompt"),
}));

// --- Import after mocks ---

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/recommend-scenarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  customerName: "Acme Corp",
  industry: "E-commerce / Retail",
  persona: "CMO",
  architecture: { enableSESidebar: true },
};

// --- Tests ---

describe("POST /api/ai/recommend-scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthResult.current = { userId: "user_test", error: null };
    mockLimit.mockResolvedValue({ success: true });
    mockGenerateText.mockResolvedValue({ output: mockOutput });
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthResult.current = { userId: null, error: "Not authenticated" };
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockLimit.mockResolvedValueOnce({ success: false });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 400 on invalid body", async () => {
    const res = await POST(makeRequest({ invalid: true }));
    expect(res.status).toBe(400);
  });

  it("returns structured recommendations on valid input", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.recommendations).toHaveLength(1);
    expect(json.recommendations[0].scenarioSlug).toBe("second-page-personalization");
    expect(json.summary).toBe("Recommended 1 scenario");
  });

  it("returns 502 when output is null", async () => {
    mockGenerateText.mockResolvedValueOnce({ output: null });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
  });

  it("returns 502 when generateText throws", async () => {
    mockGenerateText.mockRejectedValueOnce(new Error("API down"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
  });
});
