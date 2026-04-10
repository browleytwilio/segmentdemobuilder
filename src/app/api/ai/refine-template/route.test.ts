// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock state ---

const { mockAuthResult, mockLimit, mockGenerateText } = vi.hoisted(() => ({
  mockAuthResult: { current: { userId: "user_test", error: null } as { userId: string; error: null } | { userId: null; error: string } },
  mockLimit: vi.fn(() => Promise.resolve({ success: true })),
  mockGenerateText: vi.fn(() => Promise.resolve({ text: "refined template content" })),
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
  buildRefineTemplateSystemPrompt: vi.fn(() => "mock-refine-prompt"),
}));

// --- Import after mocks ---

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/refine-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  templateContent: "Create a {{CUSTOMER_NAME}} demo with Segment tracking",
  instruction: "Add more detail about event tracking",
};

// --- Tests ---

describe("POST /api/ai/refine-template", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthResult.current = { userId: "user_test", error: null };
    mockLimit.mockResolvedValue({ success: true });
    mockGenerateText.mockResolvedValue({ text: "refined template content" });
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

  it("returns 400 when templateContent is empty", async () => {
    const res = await POST(
      makeRequest({ templateContent: "", instruction: "refine" })
    );
    expect(res.status).toBe(400);
  });

  it("returns refinedContent on valid input", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.refinedContent).toBe("refined template content");
  });

  it("returns 502 when generateText throws", async () => {
    mockGenerateText.mockRejectedValueOnce(new Error("API down"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
  });
});
