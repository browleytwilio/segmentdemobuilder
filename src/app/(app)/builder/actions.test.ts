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

import {
  createPlaybook,
  getDemoFeaturesForWizard,
  fetchScenarioTemplates,
} from "./actions";

beforeEach(() => {
  vi.clearAllMocks();
  mockClerkUserId = null;
});

// ---------------------------------------------------------------------------
// createPlaybook
// ---------------------------------------------------------------------------
describe("createPlaybook", () => {
  const validInput = {
    customer_name: "Acme Corp",
    industry: "E-commerce / Retail",
    demo_config: {
      persona: "CMO" as const,
      architecture: {
        enableSESidebar: true,
        enableSeededProfiles: false,
        enableProfileAPI: false,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      },
      selectedScenarios: ["second-page-personalization"],
    },
  };

  it("returns error when not authenticated", async () => {
    const result = await createPlaybook(validInput);
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("inserts with user_id, customer_name, industry, status draft, demo_config", async () => {
    mockClerkUserId = "user_123";
    queryBuilder.single.mockResolvedValue({
      data: { id: "new-id" },
      error: null,
    });

    await createPlaybook(validInput);

    expect(mockClient.from).toHaveBeenCalledWith("playbooks");
    expect(queryBuilder.insert).toHaveBeenCalledWith({
      user_id: "user_123",
      customer_name: validInput.customer_name,
      industry: validInput.industry,
      status: "draft",
      demo_config: validInput.demo_config,
    });
    expect(queryBuilder.select).toHaveBeenCalledWith("id");
    expect(queryBuilder.single).toHaveBeenCalled();
  });

  it("returns { id } on success", async () => {
    mockClerkUserId = "user_123";
    queryBuilder.single.mockResolvedValue({
      data: { id: "new-id" },
      error: null,
    });

    const result = await createPlaybook(validInput);
    expect(result).toEqual({ id: "new-id" });
  });

  it("returns { error } on DB failure", async () => {
    mockClerkUserId = "user_123";
    queryBuilder.single.mockResolvedValue({
      data: null,
      error: { message: "insert failed" },
    });

    const result = await createPlaybook(validInput);
    expect(result).toEqual({ error: "insert failed" });
  });
});

// ---------------------------------------------------------------------------
// getDemoFeaturesForWizard
// ---------------------------------------------------------------------------
describe("getDemoFeaturesForWizard", () => {
  const features = [
    { id: "f1", slug: "sidebar", label: "SE Sidebar", description: "desc" },
    { id: "f2", slug: "profiles", label: "Seeded Profiles", description: "desc2" },
  ];

  it("queries with industry filter and is_active=true", async () => {
    withQueryResult(queryBuilder, features);

    await getDemoFeaturesForWizard("E-commerce / Retail");

    expect(mockClient.from).toHaveBeenCalledWith("demo_features");
    expect(queryBuilder.select).toHaveBeenCalledWith(
      "id, slug, label, description"
    );
    expect(queryBuilder.eq).toHaveBeenCalledWith(
      "industry",
      "E-commerce / Retail"
    );
    expect(queryBuilder.eq).toHaveBeenCalledWith("is_active", true);
  });

  it("returns { data, error: null } on success", async () => {
    withQueryResult(queryBuilder, features);

    const result = await getDemoFeaturesForWizard("E-commerce / Retail");
    expect(result).toEqual({ data: features, error: null });
  });

  it("returns { data: null, error } on failure", async () => {
    withQueryResult(queryBuilder, null, { message: "query failed" });

    const result = await getDemoFeaturesForWizard("E-commerce / Retail");
    expect(result).toEqual({ data: null, error: "query failed" });
  });

  it("orders by display_order", async () => {
    withQueryResult(queryBuilder, features);

    await getDemoFeaturesForWizard("E-commerce / Retail");

    expect(queryBuilder.order).toHaveBeenCalledWith("display_order");
  });
});

// ---------------------------------------------------------------------------
// fetchScenarioTemplates
// ---------------------------------------------------------------------------

/**
 * Build a fully self-contained chainable query builder that resolves to the
 * given result when awaited.  Unlike spreading the shared queryBuilder, every
 * chain method on the returned object points back to *itself*, so the thenable
 * at the end of the chain is the one we set here.
 */
function makeQb(result: { data: unknown; error: unknown }) {
  const qb: Record<string, any> = {};
  for (const m of ["select", "insert", "update", "delete", "eq", "in", "order", "single"]) {
    qb[m] = vi.fn(() => qb);
  }
  qb.single.mockImplementation(() => Promise.resolve(result));
  qb.then = (resolve?: (v: any) => unknown) =>
    Promise.resolve(result).then(resolve);
  return qb;
}

describe("fetchScenarioTemplates", () => {
  it("returns empty for empty featureIds array", async () => {
    const result = await fetchScenarioTemplates([]);
    expect(result).toEqual({ templates: [], invalidIds: [] });
    // Should not even call createClient
    expect(mockClient.from).not.toHaveBeenCalled();
  });

  it("fetches features with joined templates in a single query", async () => {
    const features = [
      {
        id: "f1",
        slug: "sidebar",
        prompt_templates: { id: "tpl_1", name: "Sidebar Template", content: "template content", is_active: true },
      },
    ];

    mockClient.from.mockImplementation(() =>
      makeQb({ data: features, error: null })
    );

    await fetchScenarioTemplates(["f1"]);

    expect(mockClient.from).toHaveBeenCalledWith("demo_features");
    expect(mockClient.from).toHaveBeenCalledTimes(1);
  });

  it("returns templates with featureId, slug, templateName, content", async () => {
    const features = [
      {
        id: "f1",
        slug: "sidebar",
        prompt_templates: { id: "tpl_1", name: "Sidebar Template", content: "template content", is_active: true },
      },
    ];

    mockClient.from.mockImplementation(() =>
      makeQb({ data: features, error: null })
    );

    const result = await fetchScenarioTemplates(["f1"]);
    expect(result.templates).toEqual([
      {
        featureId: "f1",
        slug: "sidebar",
        templateName: "Sidebar Template",
        content: "template content",
      },
    ]);
    expect(result.invalidIds).toEqual([]);
  });

  it("identifies invalidIds (features without active template)", async () => {
    const features = [
      {
        id: "f1",
        slug: "sidebar",
        prompt_templates: { id: "tpl_1", name: "Sidebar Template", content: "template content", is_active: true },
      },
      {
        id: "f2",
        slug: "profiles",
        prompt_templates: null,
      },
    ];

    mockClient.from.mockImplementation(() =>
      makeQb({ data: features, error: null })
    );

    const result = await fetchScenarioTemplates(["f1", "f2"]);
    expect(result.invalidIds).toEqual(["f2"]);
  });

  it("handles DB error on query", async () => {
    mockClient.from.mockImplementation(() =>
      makeQb({ data: null, error: { message: "DB error" } })
    );

    const result = await fetchScenarioTemplates(["f1", "f2"]);
    expect(result).toEqual({ templates: [], invalidIds: ["f1", "f2"] });
  });

  it("filters features with no template content", async () => {
    const features = [
      {
        id: "f1",
        slug: "sidebar",
        prompt_templates: { id: "tpl_1", name: "Sidebar Template", content: "valid content", is_active: true },
      },
      {
        id: "f2",
        slug: "profiles",
        prompt_templates: { id: "tpl_2", name: "Empty Template", content: "", is_active: true },
      },
    ];

    mockClient.from.mockImplementation(() =>
      makeQb({ data: features, error: null })
    );

    const result = await fetchScenarioTemplates(["f1", "f2"]);
    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].featureId).toBe("f1");
    expect(result.invalidIds).toEqual(["f2"]);
  });

  it("filters features with inactive templates", async () => {
    const features = [
      {
        id: "f1",
        slug: "sidebar",
        prompt_templates: { id: "tpl_1", name: "Sidebar Template", content: "content", is_active: false },
      },
    ];

    mockClient.from.mockImplementation(() =>
      makeQb({ data: features, error: null })
    );

    const result = await fetchScenarioTemplates(["f1"]);
    expect(result.templates).toHaveLength(0);
    expect(result.invalidIds).toEqual(["f1"]);
  });
});
