// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock state ---

const { mockAuthResult, mockLimit, mockGenerateText } = vi.hoisted(() => ({
  mockAuthResult: { current: { userId: "user_test", error: null } as { userId: string; error: null } | { userId: null; error: string } },
  mockLimit: vi.fn(() => Promise.resolve({ success: true })),
  mockGenerateText: vi.fn(() => Promise.resolve({ text: "enriched prompt text" })),
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
}));

vi.mock("@/lib/ai/config", () => ({
  MODELS: { chat: "mock-chat-model", fast: "mock-fast-model" },
}));

vi.mock("@/lib/ai/system-prompts", () => ({
  buildEnrichmentSystemPrompt: vi.fn(() => "mock-enrich-prompt"),
}));

// --- Import after mocks ---

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/enrich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  prompts: [
    { stepNumber: 1, title: "Setup", promptText: "Create the project" },
    { stepNumber: 2, title: "Config", promptText: "Configure environment" },
  ],
  context: {
    persona: "CMO",
    industry: "E-commerce / Retail",
    customerName: "Acme Corp",
    architecture: { enableSESidebar: true },
  },
};

// --- Tests ---

describe("POST /api/ai/enrich", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthResult.current = { userId: "user_test", error: null };
    mockLimit.mockResolvedValue({ success: true });
    mockGenerateText.mockResolvedValue({ text: "enriched prompt text" });
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

  it("returns 400 when prompts field is missing", async () => {
    const res = await POST(makeRequest({ context: validBody.context }));
    expect(res.status).toBe(400);
  });

  it("returns enrichedPrompts array on valid input", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.enrichedPrompts).toHaveLength(2);
    expect(json.enrichedPrompts[0].promptText).toBe("enriched prompt text");
    expect(json.enrichedPrompts[1].promptText).toBe("enriched prompt text");
  });

  it("falls back to original prompt when generateText rejects for one item", async () => {
    mockGenerateText
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce({ text: "enriched second" });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.enrichedPrompts[0].promptText).toBe("Create the project");
    expect(json.enrichedPrompts[1].promptText).toBe("enriched second");
  });

  it("falls back to all originals when every generateText call rejects", async () => {
    mockGenerateText.mockRejectedValue(new Error("Network failure"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.enrichedPrompts[0].promptText).toBe("Create the project");
    expect(json.enrichedPrompts[1].promptText).toBe("Configure environment");
  });
});
