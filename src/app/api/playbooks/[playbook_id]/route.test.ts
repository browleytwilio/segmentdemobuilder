// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockSupabaseClient,
  withQueryResult,
} from "@/__test-utils__/mocks/supabase";

const { client: mockClient, queryBuilder } = createMockSupabaseClient();

let mockClerkUserId: string | null = null;

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => Promise.resolve({ userId: mockClerkUserId })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

import { PATCH } from "./route";

const TEST_PLAYBOOK_ID = "test-pb-id";

function makeRequest(body?: unknown, contentType = "application/json") {
  const init: RequestInit = { method: "PATCH" };
  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
    init.headers = { "Content-Type": contentType };
  }
  return new Request(`http://localhost/api/playbooks/${TEST_PLAYBOOK_ID}`, init);
}

function callPATCH(request: Request) {
  return PATCH(request, {
    params: Promise.resolve({ playbook_id: TEST_PLAYBOOK_ID }),
  });
}

describe("PATCH /api/playbooks/[playbook_id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClerkUserId = null;
  });

  it("returns 401 when not authenticated", async () => {
    const response = await callPATCH(
      makeRequest({ generated_prompts: ["prompt1"] })
    );

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({ error: "Not authenticated" });
  });

  it("returns 400 when body is invalid JSON", async () => {
    mockClerkUserId = "user_123";

    const request = new Request(
      `http://localhost/api/playbooks/${TEST_PLAYBOOK_ID}`,
      {
        method: "PATCH",
        body: "not-valid-json{{{",
        headers: { "Content-Type": "application/json" },
      }
    );

    const response = await callPATCH(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "Invalid JSON body" });
  });

  it("returns 400 when generated_prompts is not an array", async () => {
    mockClerkUserId = "user_123";

    const response = await callPATCH(
      makeRequest({ generated_prompts: "not-an-array" })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "generated_prompts must be an array" });
  });

  it("returns { success: true } on success", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null, null);

    const response = await callPATCH(
      makeRequest({ generated_prompts: ["prompt1", "prompt2"] })
    );

    const json = await response.json();
    expect(json).toEqual({ success: true });
  });

  it("calls update with status 'completed'", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null, null);

    await callPATCH(makeRequest({ generated_prompts: ["p1"] }));

    expect(queryBuilder.update).toHaveBeenCalledWith({
      generated_prompts: ["p1"],
      status: "completed",
    });
  });

  it("calls .eq with playbook_id and user_id", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null, null);

    await callPATCH(makeRequest({ generated_prompts: ["p1"] }));

    expect(queryBuilder.eq).toHaveBeenCalledWith("id", TEST_PLAYBOOK_ID);
    expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", "user_123");
  });

  it("returns 500 on database error", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null, { message: "DB error" });

    const response = await callPATCH(
      makeRequest({ generated_prompts: ["p1"] })
    );

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json).toEqual({ error: "DB error" });
  });

  it("returns 200 status on success", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null, null);

    const response = await callPATCH(
      makeRequest({ generated_prompts: ["p1", "p2"] })
    );

    expect(response.status).toBe(200);
  });
});
