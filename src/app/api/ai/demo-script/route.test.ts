// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock state ---

const { mockAuthResult, mockLimit, mockStreamText, mockToUIStream } =
  vi.hoisted(() => ({
    mockAuthResult: { current: { userId: "user_test", error: null } as { userId: string; error: null } | { userId: null; error: string } },
    mockLimit: vi.fn(() => Promise.resolve({ success: true })),
    mockStreamText: vi.fn(),
    mockToUIStream: vi.fn(() => new Response("stream", { status: 200 })),
  }));

// --- Mocks ---

vi.mock("@/lib/ai/auth", () => ({
  requireAuthForAI: vi.fn(() => Promise.resolve(mockAuthResult.current)),
}));

vi.mock("@/lib/ai/rate-limit", () => ({
  aiGenerateRatelimit: { limit: mockLimit },
}));

vi.mock("ai", () => ({
  streamText: mockStreamText,
  convertToModelMessages: vi.fn((msgs: unknown) => Promise.resolve(msgs)),
}));

vi.mock("@/lib/ai/config", () => ({
  MODELS: { chat: "mock-chat-model", fast: "mock-fast-model" },
}));

vi.mock("@/lib/ai/system-prompts", () => ({
  buildScriptSystemPrompt: vi.fn(() => "mock-script-prompt"),
}));

// --- Import after mocks ---

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/demo-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  messages: [{ role: "user", content: "Generate a script" }],
  playbook: {
    customerName: "Acme Corp",
    persona: "CMO",
    industry: "E-commerce / Retail",
    scenarioSlugs: { f1: "second-page-personalization" },
    architecture: {
      enableSESidebar: true,
      enableSeededProfiles: false,
      enableProfileAPI: false,
      enableIntentPredictions: false,
      enableSecondPagePers: true,
    },
  },
};

// --- Tests ---

describe("POST /api/ai/demo-script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthResult.current = { userId: "user_test", error: null };
    mockLimit.mockResolvedValue({ success: true });
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: mockToUIStream,
    });
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthResult.current = { userId: null, error: "Not authenticated" };
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockLimit.mockResolvedValueOnce({ success: false });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 400 when playbook field is missing", async () => {
    const res = await POST(makeRequest({ messages: [] }));
    expect(res.status).toBe(400);
  });

  it("returns streaming response on valid input", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    expect(mockToUIStream).toHaveBeenCalled();
  });

  it("returns 502 when streamText throws", async () => {
    mockStreamText.mockImplementationOnce(() => {
      throw new Error("API down");
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
  });
});
