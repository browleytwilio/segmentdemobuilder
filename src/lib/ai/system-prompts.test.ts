// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  buildCopilotSystemPrompt,
  buildScriptSystemPrompt,
  buildEnrichmentSystemPrompt,
  buildRecommendationSystemPrompt,
  buildParseIntentSystemPrompt,
  buildRefineTemplateSystemPrompt,
} from "./system-prompts";

// ---

describe("buildCopilotSystemPrompt", () => {
  it("returns a non-empty string with no context", () => {
    const prompt = buildCopilotSystemPrompt();
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toContain("Segment");
  });

  it("includes customer name when context provided", () => {
    const prompt = buildCopilotSystemPrompt({ customerName: "Acme Corp" });
    expect(prompt).toContain("Acme Corp");
  });

  it("includes industry and persona when context provided", () => {
    const prompt = buildCopilotSystemPrompt({
      industry: "FinTech",
      persona: "CTO / Engineering",
    });
    expect(prompt).toContain("FinTech");
    expect(prompt).toContain("CTO / Engineering");
  });

  it("includes enabled architecture features", () => {
    const prompt = buildCopilotSystemPrompt({
      customerName: "Acme",
      architecture: {
        enableSESidebar: true,
        enableSeededProfiles: false,
        enableProfileAPI: true,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      },
    });
    // enableSESidebar → "S E Sidebar", enableProfileAPI → "Profile A P I"
    expect(prompt).toContain("S E Sidebar");
    expect(prompt).toContain("Profile A P I");
    expect(prompt).not.toContain("Seeded Profiles");
  });
});

// ---

describe("buildScriptSystemPrompt", () => {
  const playbook = {
    customerName: "Acme Corp",
    persona: "CMO",
    industry: "E-commerce / Retail",
    scenarioSlugs: { f1: "second-page-personalization", f2: "cart-abandonment-recovery" },
    architecture: {
      enableSESidebar: true,
      enableSeededProfiles: false,
      enableProfileAPI: false,
      enableIntentPredictions: false,
      enableSecondPagePers: true,
    },
  };

  it("includes customer name in the prompt", () => {
    const prompt = buildScriptSystemPrompt(playbook);
    expect(prompt).toContain("Acme Corp");
  });

  it("includes scenario slugs in human-readable form", () => {
    const prompt = buildScriptSystemPrompt(playbook);
    expect(prompt).toContain("second page personalization");
    expect(prompt).toContain("cart abandonment recovery");
  });
});

// ---

describe("buildEnrichmentSystemPrompt", () => {
  it("includes persona and industry", () => {
    const prompt = buildEnrichmentSystemPrompt("CTO / Engineering", "FinTech");
    expect(prompt).toContain("CTO / Engineering");
    expect(prompt).toContain("FinTech");
  });

  it("mentions Segment in the returned string", () => {
    const prompt = buildEnrichmentSystemPrompt("CMO", "E-commerce / Retail");
    expect(prompt).toContain("Segment");
  });
});

// ---

describe("buildRecommendationSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildRecommendationSystemPrompt();
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("includes available scenario slugs", () => {
    const prompt = buildRecommendationSystemPrompt();
    expect(prompt).toContain("second-page-personalization");
    expect(prompt).toContain("edge-pii-masking");
    expect(prompt).toContain("content-affinity-engine");
  });
});

// ---

describe("buildParseIntentSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildParseIntentSystemPrompt();
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("references valid industry values", () => {
    const prompt = buildParseIntentSystemPrompt();
    expect(prompt).toContain("E-commerce / Retail");
    expect(prompt).toContain("B2B SaaS");
    expect(prompt).toContain("FinTech");
  });
});

// ---

describe("buildRefineTemplateSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildRefineTemplateSystemPrompt();
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("references template variable placeholders", () => {
    const prompt = buildRefineTemplateSystemPrompt();
    expect(prompt).toContain("{{CUSTOMER_NAME}}");
    expect(prompt).toContain("{{SEGMENT_WRITE_KEY}}");
  });
});
