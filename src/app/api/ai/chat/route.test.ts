// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock state ---

const {
  mockAuthResult,
  mockLimit,
  mockStreamText,
  mockToUIMessageStreamResponse,
} = vi.hoisted(() => ({
  mockAuthResult: { current: { userId: "user_test", error: null } as { userId: string; error: null } | { userId: null; error: string } },
  mockLimit: vi.fn(() => Promise.resolve({ success: true })),
  mockStreamText: vi.fn(),
  mockToUIMessageStreamResponse: vi.fn(() => new Response("stream", { status: 200 })),
}));

// --- Mocks ---

vi.mock("@/lib/ai/auth", () => ({
  requireAuthForAI: vi.fn(() => Promise.resolve(mockAuthResult.current)),
}));

vi.mock("@/lib/ai/rate-limit", () => ({
  aiChatRatelimit: { limit: mockLimit },
}));

vi.mock("ai", () => ({
  streamText: mockStreamText,
  convertToModelMessages: vi.fn((msgs: unknown) => Promise.resolve(msgs)),
  stepCountIs: vi.fn(),
}));

vi.mock("@/lib/ai/config", () => ({
  MODELS: { chat: "mock-chat-model", fast: "mock-fast-model" },
}));

vi.mock("@/lib/ai/system-prompts", () => ({
  buildCopilotSystemPrompt: vi.fn(() => "mock-system-prompt"),
}));

vi.mock("@/lib/ai/tools/segment-knowledge", () => ({
  segmentKnowledgeTool: { execute: vi.fn() },
}));

// --- Import after mocks ---

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  messages: [{ role: "user", content: "What is identity resolution?" }],
};

// --- Tests ---

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthResult.current = { userId: "user_test", error: null };
    mockLimit.mockResolvedValue({ success: true });
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: mockToUIMessageStreamResponse,
    });
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthResult.current = { userId: null, error: "Not authenticated" };
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Not authenticated");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockLimit.mockResolvedValueOnce({ success: false });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 400 on invalid request body", async () => {
    const res = await POST(makeRequest({ invalid: true }));
    expect(res.status).toBe(400);
  });

  it("returns streaming response on valid input", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    expect(mockToUIMessageStreamResponse).toHaveBeenCalled();
  });

  it("returns 502 when streamText throws", async () => {
    mockStreamText.mockImplementationOnce(() => {
      throw new Error("API down");
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe("AI service unavailable");
  });
});
