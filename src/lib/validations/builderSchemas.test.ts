import { describe, it, expect } from "vitest";
import {
  contextSchema,
  architectureSchema,
  scenariosSchema,
  PERSONA_OPTIONS,
  INDUSTRY_OPTIONS,
} from "@/lib/validations/builderSchemas";

describe("contextSchema", () => {
  it("accepts valid input", () => {
    const result = contextSchema.safeParse({
      customerName: "Acme Corp",
      persona: "CMO",
      industry: "E-commerce / Retail",
    });
    expect(result.success).toBe(true);
  });

  it("rejects customerName shorter than 2 characters", () => {
    const result = contextSchema.safeParse({
      customerName: "A",
      persona: "CMO",
      industry: "B2B SaaS",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path[0] === "customerName"
      );
      expect(issue?.message).toBe(
        "Customer name must be at least 2 characters"
      );
    }
  });

  it("accepts customerName at exactly 2 characters", () => {
    const result = contextSchema.safeParse({
      customerName: "AB",
      persona: "CMO",
      industry: "FinTech",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty customerName", () => {
    const result = contextSchema.safeParse({
      customerName: "",
      persona: "CMO",
      industry: "FinTech",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid persona", () => {
    const result = contextSchema.safeParse({
      customerName: "Acme Corp",
      persona: "Intern",
      industry: "B2B SaaS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid industry", () => {
    const result = contextSchema.safeParse({
      customerName: "Acme Corp",
      persona: "CMO",
      industry: "Healthcare",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid persona values", () => {
    for (const persona of PERSONA_OPTIONS) {
      const result = contextSchema.safeParse({
        customerName: "Test Co",
        persona,
        industry: "FinTech",
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid industry values", () => {
    for (const industry of INDUSTRY_OPTIONS) {
      const result = contextSchema.safeParse({
        customerName: "Test Co",
        persona: "CMO",
        industry,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("architectureSchema", () => {
  const baseArch = {
    enableSESidebar: true,
    enableSeededProfiles: false,
    enableProfileAPI: true,
    enableIntentPredictions: false,
    enableSecondPagePers: false,
    databaseProvider: "supabase" as const,
    authProvider: "none" as const,
  };

  it("accepts all boolean fields", () => {
    const result = architectureSchema.safeParse(baseArch);
    expect(result.success).toBe(true);
  });

  it("rejects non-boolean values", () => {
    const result = architectureSchema.safeParse({
      ...baseArch,
      enableSESidebar: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = architectureSchema.safeParse({
      enableSESidebar: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all-false configuration", () => {
    const result = architectureSchema.safeParse({
      ...baseArch,
      enableSESidebar: false,
      enableSeededProfiles: false,
      enableProfileAPI: false,
      enableIntentPredictions: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all-true configuration", () => {
    const result = architectureSchema.safeParse({
      ...baseArch,
      enableSESidebar: true,
      enableSeededProfiles: true,
      enableProfileAPI: true,
      enableIntentPredictions: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts neon as databaseProvider", () => {
    const result = architectureSchema.safeParse({
      ...baseArch,
      databaseProvider: "neon",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid databaseProvider", () => {
    const result = architectureSchema.safeParse({
      ...baseArch,
      databaseProvider: "mongodb",
    });
    expect(result.success).toBe(false);
  });

  it("accepts clerk as authProvider", () => {
    const result = architectureSchema.safeParse({
      ...baseArch,
      authProvider: "clerk",
    });
    expect(result.success).toBe(true);
  });
});

describe("scenariosSchema", () => {
  it("accepts an array of strings", () => {
    const result = scenariosSchema.safeParse({
      selectedScenarios: ["second-page-personalization", "cart-abandonment-recovery"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty array", () => {
    const result = scenariosSchema.safeParse({
      selectedScenarios: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-array value", () => {
    const result = scenariosSchema.safeParse({
      selectedScenarios: "single-string",
    });
    expect(result.success).toBe(false);
  });
});

describe("PERSONA_OPTIONS", () => {
  it("has exactly 4 options", () => {
    expect(PERSONA_OPTIONS).toHaveLength(4);
  });

  it("contains the expected personas", () => {
    expect(PERSONA_OPTIONS).toContain("CMO");
    expect(PERSONA_OPTIONS).toContain("CTO / Engineering");
    expect(PERSONA_OPTIONS).toContain("Product Manager");
    expect(PERSONA_OPTIONS).toContain("Data Team");
  });
});

describe("INDUSTRY_OPTIONS", () => {
  it("has exactly 4 options", () => {
    expect(INDUSTRY_OPTIONS).toHaveLength(4);
  });

  it("contains the expected industries", () => {
    expect(INDUSTRY_OPTIONS).toContain("E-commerce / Retail");
    expect(INDUSTRY_OPTIONS).toContain("B2B SaaS");
    expect(INDUSTRY_OPTIONS).toContain("FinTech");
    expect(INDUSTRY_OPTIONS).toContain("Media & Entertainment");
  });
});
