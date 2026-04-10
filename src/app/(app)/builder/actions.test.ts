// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockSupabaseClient,
  withAuthenticatedUser,
  withQueryResult,
} from "@/__test-utils__/mocks/supabase";

const { client: mockClient, queryBuilder } = createMockSupabaseClient();

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
  // Reset auth to unauthenticated
  mockClient.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
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
    const user = withAuthenticatedUser(mockClient);
    queryBuilder.single.mockResolvedValue({
      data: { id: "new-id" },
      error: null,
    });

    await createPlaybook(validInput);

    expect(mockClient.from).toHaveBeenCalledWith("playbooks");
    expect(queryBuilder.insert).toHaveBeenCalledWith({
      user_id: user.id,
      customer_name: validInput.customer_name,
      industry: validInput.industry,
      status: "draft",
      demo_config: validInput.demo_config,
    });
    expect(queryBuilder.select).toHaveBeenCalledWith("id");
    expect(queryBuilder.single).toHaveBeenCalled();
  });

  it("returns { id } on success", async () => {
    withAuthenticatedUser(mockClient);
    queryBuilder.single.mockResolvedValue({
      data: { id: "new-id" },
      error: null,
    });

    const result = await createPlaybook(validInput);
    expect(result).toEqual({ id: "new-id" });
  });

  it("returns { error } on DB failure", async () => {
    withAuthenticatedUser(mockClient);
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
describe("fetchScenarioTemplates", () => {
  it("returns empty for empty featureIds array", async () => {
    const result = await fetchScenarioTemplates([]);
    expect(result).toEqual({ templates: [], invalidIds: [] });
    // Should not even call createClient
    expect(mockClient.from).not.toHaveBeenCalled();
  });

  it("fetches features then templates", async () => {
    const features = [
      { id: "f1", slug: "sidebar", prompt_template_id: "tpl_1" },
    ];
    const templates = [
      { id: "tpl_1", name: "Sidebar Template", content: "template content" },
    ];

    // First from("demo_features") call resolves with features
    // Second from("prompt_templates") call resolves with templates
    let fromCallCount = 0;
    mockClient.from.mockImplementation((table: string) => {
      fromCallCount++;
      if (table === "demo_features") {
        const featuresQb = { ...queryBuilder };
        const featuresResult = { data: features, error: null };
        (featuresQb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve(featuresResult).then(resolve);
        return featuresQb;
      }
      if (table === "prompt_templates") {
        const tplQb = { ...queryBuilder };
        const tplResult = { data: templates, error: null };
        (tplQb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve(tplResult).then(resolve);
        return tplQb;
      }
      return queryBuilder;
    });

    await fetchScenarioTemplates(["f1"]);

    expect(mockClient.from).toHaveBeenCalledWith("demo_features");
    expect(mockClient.from).toHaveBeenCalledWith("prompt_templates");
  });

  it("returns templates with featureId, slug, templateName, content", async () => {
    const features = [
      { id: "f1", slug: "sidebar", prompt_template_id: "tpl_1" },
    ];
    const templates = [
      { id: "tpl_1", name: "Sidebar Template", content: "template content" },
    ];

    mockClient.from.mockImplementation((table: string) => {
      const qb = { ...queryBuilder };
      if (table === "demo_features") {
        (qb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve({ data: features, error: null }).then(resolve);
      } else {
        (qb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve({ data: templates, error: null }).then(resolve);
      }
      return qb;
    });

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

  it("identifies invalidIds (features without matching template)", async () => {
    const features = [
      { id: "f1", slug: "sidebar", prompt_template_id: "tpl_1" },
      { id: "f2", slug: "profiles", prompt_template_id: "tpl_missing" },
    ];
    const templates = [
      { id: "tpl_1", name: "Sidebar Template", content: "template content" },
    ];

    mockClient.from.mockImplementation((table: string) => {
      const qb = { ...queryBuilder };
      if (table === "demo_features") {
        (qb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve({ data: features, error: null }).then(resolve);
      } else {
        (qb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve({ data: templates, error: null }).then(resolve);
      }
      return qb;
    });

    const result = await fetchScenarioTemplates(["f1", "f2"]);
    expect(result.invalidIds).toEqual(["f2"]);
  });

  it("handles DB error on first query", async () => {
    mockClient.from.mockImplementation((table: string) => {
      const qb = { ...queryBuilder };
      if (table === "demo_features") {
        (qb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve({ data: null, error: { message: "DB error" } }).then(
            resolve
          );
      } else {
        (qb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve({ data: null, error: null }).then(resolve);
      }
      return qb;
    });

    const result = await fetchScenarioTemplates(["f1", "f2"]);
    expect(result).toEqual({ templates: [], invalidIds: ["f1", "f2"] });
  });

  it("filters features with no template content", async () => {
    const features = [
      { id: "f1", slug: "sidebar", prompt_template_id: "tpl_1" },
      { id: "f2", slug: "profiles", prompt_template_id: "tpl_2" },
    ];
    const templates = [
      { id: "tpl_1", name: "Sidebar Template", content: "valid content" },
      { id: "tpl_2", name: "Empty Template", content: "" },
    ];

    mockClient.from.mockImplementation((table: string) => {
      const qb = { ...queryBuilder };
      if (table === "demo_features") {
        (qb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve({ data: features, error: null }).then(resolve);
      } else {
        (qb as any).then = (resolve?: (v: any) => unknown) =>
          Promise.resolve({ data: templates, error: null }).then(resolve);
      }
      return qb;
    });

    const result = await fetchScenarioTemplates(["f1", "f2"]);
    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].featureId).toBe("f1");
    expect(result.invalidIds).toEqual(["f2"]);
  });
});
