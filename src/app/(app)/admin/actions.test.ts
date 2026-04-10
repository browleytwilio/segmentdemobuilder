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
  getAdminUsers,
  updateUserRole,
  getPromptTemplates,
  getActivePromptTemplates,
  savePromptTemplate,
  createPromptTemplate,
  getDemoFeatures,
  createDemoFeature,
  updateDemoFeature,
  deactivateDemoFeature,
} from "./actions";
import { revalidatePath } from "next/cache";

beforeEach(() => {
  vi.clearAllMocks();
  // Reset auth to unauthenticated
  mockClient.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
});

/**
 * Set up the mock client as an authenticated super_admin.
 * The first .single() call after auth resolves the profile role check.
 */
function setupAsAdmin(
  user = { id: "admin_1", email: "admin@test.com" }
) {
  withAuthenticatedUser(mockClient, user);
  // requireAdmin calls .from("profiles").select("role").eq("id", user.id).single()
  queryBuilder.single.mockResolvedValueOnce({
    data: { role: "super_admin" },
    error: null,
  });
  return user;
}

/**
 * Set up as a regular (non-admin) authenticated user.
 */
function setupAsNonAdmin() {
  withAuthenticatedUser(mockClient, { id: "user_1", email: "user@test.com" });
  queryBuilder.single.mockResolvedValueOnce({
    data: { role: "user" },
    error: null,
  });
}

// ---------------------------------------------------------------------------
// getAdminUsers
// ---------------------------------------------------------------------------
describe("getAdminUsers", () => {
  it("rejects unauthenticated users", async () => {
    const result = await getAdminUsers();
    expect(result).toEqual({ data: null, error: "Not authenticated" });
  });

  it("rejects non-admin users", async () => {
    setupAsNonAdmin();

    const result = await getAdminUsers();
    expect(result).toEqual({ data: null, error: "Forbidden" });
  });

  it("calls RPC admin_users_with_playbook_count", async () => {
    setupAsAdmin();
    mockClient.rpc.mockResolvedValue({
      data: [{ id: "u1", email: "a@b.com", playbook_count: 3 }],
      error: null,
    });

    await getAdminUsers();

    expect(mockClient.rpc).toHaveBeenCalledWith(
      "admin_users_with_playbook_count"
    );
  });

  it("returns { data, error: null } on success", async () => {
    setupAsAdmin();
    const users = [{ id: "u1", email: "a@b.com", playbook_count: 3 }];
    mockClient.rpc.mockResolvedValue({ data: users, error: null });

    const result = await getAdminUsers();
    expect(result).toEqual({ data: users, error: null });
  });

  it("returns { data: null, error } on failure", async () => {
    setupAsAdmin();
    mockClient.rpc.mockResolvedValue({
      data: null,
      error: { message: "rpc failed" },
    });

    const result = await getAdminUsers();
    expect(result).toEqual({ data: null, error: "rpc failed" });
  });
});

// ---------------------------------------------------------------------------
// updateUserRole
// ---------------------------------------------------------------------------
describe("updateUserRole", () => {
  it("rejects non-admin", async () => {
    setupAsNonAdmin();

    const result = await updateUserRole("user_2", "user");
    expect(result).toEqual({ error: "Forbidden" });
  });

  it("blocks browley@twilio.com modification", async () => {
    setupAsAdmin();
    // After admin check, the next .single() fetches the target profile email
    queryBuilder.single.mockResolvedValueOnce({
      data: { email: "browley@twilio.com" },
      error: null,
    });

    const result = await updateUserRole("protected_user", "user");
    expect(result).toEqual({
      error: "This account is protected and cannot be modified.",
    });
  });

  it("updates role for non-protected user", async () => {
    setupAsAdmin();
    // Target email check
    queryBuilder.single.mockResolvedValueOnce({
      data: { email: "other@test.com" },
      error: null,
    });
    // The update chain resolves via the thenable queryBuilder
    withQueryResult(queryBuilder, null);

    await updateUserRole("user_2", "super_admin");

    expect(queryBuilder.update).toHaveBeenCalledWith({
      role: "super_admin",
    });
    expect(queryBuilder.eq).toHaveBeenCalledWith("id", "user_2");
  });

  it("calls revalidatePath('/admin/users') on success", async () => {
    setupAsAdmin();
    queryBuilder.single.mockResolvedValueOnce({
      data: { email: "other@test.com" },
      error: null,
    });
    withQueryResult(queryBuilder, null);

    await updateUserRole("user_2", "user");

    expect(revalidatePath).toHaveBeenCalledWith("/admin/users");
  });

  it("returns { error } on DB failure", async () => {
    setupAsAdmin();
    queryBuilder.single.mockResolvedValueOnce({
      data: { email: "other@test.com" },
      error: null,
    });
    withQueryResult(queryBuilder, null, { message: "update failed" });

    const result = await updateUserRole("user_2", "user");
    expect(result).toEqual({ error: "update failed" });
  });
});

// ---------------------------------------------------------------------------
// getPromptTemplates
// ---------------------------------------------------------------------------
describe("getPromptTemplates", () => {
  it("rejects non-admin", async () => {
    setupAsNonAdmin();

    const result = await getPromptTemplates();
    expect(result).toEqual({ data: null, error: "Forbidden" });
  });

  it("returns ordered templates", async () => {
    setupAsAdmin();
    const templates = [
      { id: "tpl_1", name: "Template A", category: "scenario" },
      { id: "tpl_2", name: "Template B", category: "scaffold" },
    ];
    withQueryResult(queryBuilder, templates);

    const result = await getPromptTemplates();

    expect(mockClient.from).toHaveBeenCalledWith("prompt_templates");
    expect(queryBuilder.select).toHaveBeenCalledWith("*");
    expect(queryBuilder.order).toHaveBeenCalledWith("category");
    expect(queryBuilder.order).toHaveBeenCalledWith("name");
    expect(result).toEqual({ data: templates, error: null });
  });
});

// ---------------------------------------------------------------------------
// getActivePromptTemplates
// ---------------------------------------------------------------------------
describe("getActivePromptTemplates", () => {
  it("rejects non-admin", async () => {
    setupAsNonAdmin();

    const result = await getActivePromptTemplates();
    expect(result).toEqual({ data: null, error: "Forbidden" });
  });

  it("filters by is_active=true and returns ordered templates", async () => {
    setupAsAdmin();
    const templates = [{ id: "tpl_1", name: "Active Template" }];
    withQueryResult(queryBuilder, templates);

    const result = await getActivePromptTemplates();

    expect(queryBuilder.eq).toHaveBeenCalledWith("is_active", true);
    expect(queryBuilder.order).toHaveBeenCalledWith("category");
    expect(queryBuilder.order).toHaveBeenCalledWith("name");
    expect(result).toEqual({ data: templates, error: null });
  });
});

// ---------------------------------------------------------------------------
// savePromptTemplate
// ---------------------------------------------------------------------------
describe("savePromptTemplate", () => {
  it("rejects non-admin", async () => {
    setupAsNonAdmin();

    const result = await savePromptTemplate("tpl_1", "new content");
    expect(result).toEqual({ error: "Forbidden", newVersion: null });
  });

  it("returns error when template not found", async () => {
    setupAsAdmin();
    // Fetching current template fails
    queryBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { message: "not found" },
    });

    const result = await savePromptTemplate("tpl_missing", "content");
    expect(result).toEqual({ error: "Template not found.", newVersion: null });
  });

  it("archives current and inserts new version", async () => {
    const user = setupAsAdmin();
    const currentTemplate = {
      id: "tpl_1",
      name: "Test Template",
      category: "scenario",
      content: "old content",
      version: 3,
      is_active: true,
      updated_by: "someone",
    };
    // Fetch current template
    queryBuilder.single.mockResolvedValueOnce({
      data: currentTemplate,
      error: null,
    });
    // Archive update (thenable resolves)
    withQueryResult(queryBuilder, null);

    const result = await savePromptTemplate("tpl_1", "new content");

    // Should archive current row
    expect(queryBuilder.update).toHaveBeenCalledWith({ is_active: false });
    // Should insert new version
    expect(queryBuilder.insert).toHaveBeenCalledWith({
      name: "Test Template",
      category: "scenario",
      content: "new content",
      version: 4,
      is_active: true,
      updated_by: user.id,
    });
    expect(result).toEqual({ error: null, newVersion: 4 });
  });

  it("increments version number", async () => {
    setupAsAdmin();
    queryBuilder.single.mockResolvedValueOnce({
      data: {
        id: "tpl_1",
        name: "T",
        category: "scaffold",
        content: "old",
        version: 7,
        is_active: true,
      },
      error: null,
    });
    withQueryResult(queryBuilder, null);

    const result = await savePromptTemplate("tpl_1", "updated");
    expect(result.newVersion).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// createPromptTemplate
// ---------------------------------------------------------------------------
describe("createPromptTemplate", () => {
  it("rejects non-admin", async () => {
    setupAsNonAdmin();

    const result = await createPromptTemplate("name", "category", "content");
    expect(result).toEqual({ error: "Forbidden" });
  });

  it("inserts with version=1, is_active=true", async () => {
    const user = setupAsAdmin();
    withQueryResult(queryBuilder, null);

    const result = await createPromptTemplate(
      "New Template",
      "scenario",
      "template content"
    );

    expect(mockClient.from).toHaveBeenCalledWith("prompt_templates");
    expect(queryBuilder.insert).toHaveBeenCalledWith({
      name: "New Template",
      category: "scenario",
      content: "template content",
      version: 1,
      is_active: true,
      updated_by: user.id,
    });
    expect(result).toEqual({ error: null });
  });

  it("calls revalidatePath('/admin/prompts') on success", async () => {
    setupAsAdmin();
    withQueryResult(queryBuilder, null);

    await createPromptTemplate("N", "c", "content");

    expect(revalidatePath).toHaveBeenCalledWith("/admin/prompts");
  });
});

// ---------------------------------------------------------------------------
// getDemoFeatures
// ---------------------------------------------------------------------------
describe("getDemoFeatures", () => {
  it("rejects non-admin", async () => {
    setupAsNonAdmin();

    const result = await getDemoFeatures();
    expect(result).toEqual({ data: null, error: "Forbidden" });
  });

  it("filters by industry when provided", async () => {
    setupAsAdmin();
    const features = [{ id: "f1", slug: "sidebar", industry: "Retail" }];
    withQueryResult(queryBuilder, features);

    const result = await getDemoFeatures("Retail");

    expect(queryBuilder.eq).toHaveBeenCalledWith("industry", "Retail");
    expect(result).toEqual({ data: features, error: null });
  });

  it("returns all when industry not provided", async () => {
    setupAsAdmin();
    const features = [
      { id: "f1", slug: "sidebar", industry: "Retail" },
      { id: "f2", slug: "profiles", industry: "Healthcare" },
    ];
    withQueryResult(queryBuilder, features);

    const result = await getDemoFeatures();

    expect(mockClient.from).toHaveBeenCalledWith("demo_features");
    expect(queryBuilder.select).toHaveBeenCalledWith(
      "*, prompt_templates(id, name)"
    );
    expect(queryBuilder.order).toHaveBeenCalledWith("industry");
    expect(queryBuilder.order).toHaveBeenCalledWith("display_order");
    // eq should only be called for the profile role check, not for industry
    // (the admin check calls .eq("id", userId) on the profiles query)
    expect(result).toEqual({ data: features, error: null });
  });
});

// ---------------------------------------------------------------------------
// createDemoFeature
// ---------------------------------------------------------------------------
describe("createDemoFeature", () => {
  it("rejects non-admin", async () => {
    setupAsNonAdmin();

    const result = await createDemoFeature(
      "Retail",
      "sidebar",
      "SE Sidebar",
      "Description",
      "tpl_1"
    );
    expect(result).toEqual({ error: "Forbidden" });
  });

  it("inserts with fields", async () => {
    setupAsAdmin();
    withQueryResult(queryBuilder, null);

    const result = await createDemoFeature(
      "E-commerce / Retail",
      "sidebar",
      "SE Sidebar",
      "Sidebar description",
      "tpl_1"
    );

    expect(mockClient.from).toHaveBeenCalledWith("demo_features");
    expect(queryBuilder.insert).toHaveBeenCalledWith({
      industry: "E-commerce / Retail",
      slug: "sidebar",
      label: "SE Sidebar",
      description: "Sidebar description",
      prompt_template_id: "tpl_1",
    });
    expect(result).toEqual({ error: null });
  });

  it("calls revalidatePath('/admin/config') on success", async () => {
    setupAsAdmin();
    withQueryResult(queryBuilder, null);

    await createDemoFeature("Retail", "s", "L", "D", "tpl_1");

    expect(revalidatePath).toHaveBeenCalledWith("/admin/config");
  });
});

// ---------------------------------------------------------------------------
// updateDemoFeature
// ---------------------------------------------------------------------------
describe("updateDemoFeature", () => {
  it("rejects non-admin", async () => {
    setupAsNonAdmin();

    const result = await updateDemoFeature("f1", { label: "New Label" });
    expect(result).toEqual({ error: "Forbidden" });
  });

  it("updates with provided fields", async () => {
    setupAsAdmin();
    withQueryResult(queryBuilder, null);

    await updateDemoFeature("f1", {
      label: "New Label",
      display_order: 5,
    });

    expect(queryBuilder.update).toHaveBeenCalledWith({
      label: "New Label",
      display_order: 5,
    });
    expect(queryBuilder.eq).toHaveBeenCalledWith("id", "f1");
  });

  it("calls revalidatePath('/admin/config') on success", async () => {
    setupAsAdmin();
    withQueryResult(queryBuilder, null);

    await updateDemoFeature("f1", { label: "X" });

    expect(revalidatePath).toHaveBeenCalledWith("/admin/config");
  });
});

// ---------------------------------------------------------------------------
// deactivateDemoFeature
// ---------------------------------------------------------------------------
describe("deactivateDemoFeature", () => {
  it("delegates to updateDemoFeature with is_active=false", async () => {
    setupAsAdmin();
    withQueryResult(queryBuilder, null);

    const result = await deactivateDemoFeature("f1");

    expect(queryBuilder.update).toHaveBeenCalledWith({ is_active: false });
    expect(queryBuilder.eq).toHaveBeenCalledWith("id", "f1");
    expect(result).toEqual({ error: null });
  });
});
