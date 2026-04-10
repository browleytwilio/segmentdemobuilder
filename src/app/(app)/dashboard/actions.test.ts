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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { getPlaybooks, deletePlaybook, getPlaybookById } from "./actions";
import { revalidatePath } from "next/cache";

beforeEach(() => {
  vi.clearAllMocks();
  mockClerkUserId = null;
});

// ---------------------------------------------------------------------------
// getPlaybooks
// ---------------------------------------------------------------------------
describe("getPlaybooks", () => {
  const playbooks = [
    {
      id: "pb_1",
      customer_name: "Acme Corp",
      industry: "E-commerce / Retail",
      status: "completed",
      updated_at: "2026-04-02T00:00:00Z",
    },
    {
      id: "pb_2",
      customer_name: "Beta Inc",
      industry: "Healthcare",
      status: "draft",
      updated_at: "2026-04-01T00:00:00Z",
    },
  ];

  it("returns [] when not authenticated", async () => {
    const result = await getPlaybooks();
    expect(result).toEqual([]);
  });

  it("queries with user_id filter", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, playbooks);

    await getPlaybooks();

    expect(mockClient.from).toHaveBeenCalledWith("playbooks");
    expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", "user_123");
  });

  it("returns [] on DB error", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null, { message: "query error" });

    const result = await getPlaybooks();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// deletePlaybook
// ---------------------------------------------------------------------------
describe("deletePlaybook", () => {
  it("returns { error } when not authenticated", async () => {
    const result = await deletePlaybook("pb_1");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("deletes with id and user_id filters", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null);

    await deletePlaybook("pb_1");

    expect(mockClient.from).toHaveBeenCalledWith("playbooks");
    expect(queryBuilder.delete).toHaveBeenCalled();
    expect(queryBuilder.eq).toHaveBeenCalledWith("id", "pb_1");
    expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", "user_123");
  });

  it("calls revalidatePath('/dashboard') on success", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null);

    await deletePlaybook("pb_1");

    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("returns { error } on DB failure", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null, { message: "delete failed" });

    const result = await deletePlaybook("pb_1");
    expect(result).toEqual({ error: "delete failed" });
  });

  it("returns {} on success", async () => {
    mockClerkUserId = "user_123";
    withQueryResult(queryBuilder, null);

    const result = await deletePlaybook("pb_1");
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// getPlaybookById
// ---------------------------------------------------------------------------
describe("getPlaybookById", () => {
  const playbookRow = {
    id: "pb_1",
    customer_name: "Acme Corp",
    industry: "E-commerce / Retail",
    status: "completed",
    demo_config: {
      persona: "CMO",
      architecture: {
        enableSESidebar: true,
        enableSeededProfiles: false,
        enableProfileAPI: false,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      },
      selectedScenarios: [],
    },
    generated_prompts: [],
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T12:00:00Z",
  };

  it("returns null when not authenticated", async () => {
    const result = await getPlaybookById("pb_1");
    expect(result).toBeNull();
  });

  it("returns null when not found", async () => {
    mockClerkUserId = "user_123";
    queryBuilder.single.mockResolvedValue({
      data: null,
      error: { message: "not found", code: "PGRST116" },
    });

    const result = await getPlaybookById("pb_nonexistent");
    expect(result).toBeNull();
  });

  it("returns PlaybookRow on success", async () => {
    mockClerkUserId = "user_123";
    queryBuilder.single.mockResolvedValue({
      data: playbookRow,
      error: null,
    });

    const result = await getPlaybookById("pb_1");

    expect(result).toEqual(playbookRow);
    expect(mockClient.from).toHaveBeenCalledWith("playbooks");
    expect(queryBuilder.select).toHaveBeenCalledWith("*");
    expect(queryBuilder.eq).toHaveBeenCalledWith("id", "pb_1");
    expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", "user_123");
    expect(queryBuilder.single).toHaveBeenCalled();
  });
});
