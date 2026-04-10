import { describe, it, expect } from "vitest";
import { generateDemoScript } from "./demo-script";
import type { DemoArchitecture } from "@/lib/stores/builder-store";

function mockInput(overrides?: Partial<Parameters<typeof generateDemoScript>[0]>) {
  return {
    customerName: "Acme Corp",
    persona: "CMO",
    industry: "E-commerce / Retail",
    selectedScenarios: ["second-page-personalization"],
    architecture: {
      enableSESidebar: true,
      enableSeededProfiles: true,
      enableProfileAPI: false,
      enableIntentPredictions: false,
      enableSecondPagePers: false,
    } satisfies DemoArchitecture,
    ...overrides,
  };
}

describe("generateDemoScript", () => {
  it("includes customer name in header", () => {
    const script = generateDemoScript(mockInput());
    expect(script).toContain("# Acme Corp — SE Demo Script");
  });

  it("includes industry and persona in header", () => {
    const script = generateDemoScript(mockInput());
    expect(script).toContain("**Industry:** E-commerce / Retail");
    expect(script).toContain("**Target Persona:** CMO");
  });

  it("includes setup checklist section", () => {
    const script = generateDemoScript(mockInput());
    expect(script).toContain("## Setup Checklist");
    expect(script).toContain("npm run dev");
  });

  it("adds SE Sidebar checklist item when enabled", () => {
    const script = generateDemoScript(
      mockInput({ architecture: { ...mockInput().architecture, enableSESidebar: true } })
    );
    expect(script).toContain("SE Sidebar is visible");
  });

  it("omits SE Sidebar checklist item when disabled", () => {
    const script = generateDemoScript(
      mockInput({ architecture: { ...mockInput().architecture, enableSESidebar: false } })
    );
    expect(script).not.toContain("SE Sidebar is visible");
  });

  it("adds seeded profiles checklist item when enabled", () => {
    const script = generateDemoScript(
      mockInput({ architecture: { ...mockInput().architecture, enableSeededProfiles: true } })
    );
    expect(script).toContain("Seeded profiles have been loaded");
  });

  it("omits seeded profiles checklist item when disabled", () => {
    const script = generateDemoScript(
      mockInput({ architecture: { ...mockInput().architecture, enableSeededProfiles: false } })
    );
    expect(script).not.toContain("Seeded profiles have been loaded");
  });

  it("includes narrative section with customer name", () => {
    const script = generateDemoScript(mockInput());
    expect(script).toContain("Acme Corp");
    expect(script).toContain("## The Narrative");
  });

  it("renders numbered steps for each scenario", () => {
    const script = generateDemoScript(mockInput());
    expect(script).toContain("### Second-Page Personalization");
    expect(script).toMatch(/1\. /);
    expect(script).toMatch(/2\. /);
  });

  it("renders aha moment for each scenario", () => {
    const script = generateDemoScript(mockInput());
    expect(script).toContain('**"Aha!" Moment:**');
  });

  it("skips unknown scenario slugs", () => {
    const script = generateDemoScript(
      mockInput({ selectedScenarios: ["nonexistent-scenario"] })
    );
    expect(script).not.toContain("### ");
    expect(script).toContain("## Closing");
  });

  it("resolves featureId to slug via scenarioSlugs map", () => {
    const script = generateDemoScript(
      mockInput({
        selectedScenarios: ["feat_uuid_123"],
        scenarioSlugs: { feat_uuid_123: "cart-abandonment-recovery" },
      })
    );
    expect(script).toContain("### Cart Abandonment Recovery");
  });

  it("falls back to scenarioId as slug when no scenarioSlugs", () => {
    const script = generateDemoScript(
      mockInput({ selectedScenarios: ["authenticated-vip-state"] })
    );
    expect(script).toContain("### Authenticated VIP State");
  });

  it("renders closing section", () => {
    const script = generateDemoScript(mockInput());
    expect(script).toContain("## Closing");
    expect(script).toContain("Next Steps");
  });

  it("handles empty selectedScenarios without scenarios section header", () => {
    const script = generateDemoScript(mockInput({ selectedScenarios: [] }));
    expect(script).not.toContain("## Demo Scenarios");
    expect(script).toContain("## Closing");
  });

  it("returns a string", () => {
    const script = generateDemoScript(mockInput());
    expect(typeof script).toBe("string");
    expect(script.length).toBeGreaterThan(0);
  });
});

describe("CLICK_PATH_REGISTRY coverage", () => {
  const allSlugs = [
    "second-page-personalization",
    "authenticated-vip-state",
    "cart-abandonment-recovery",
    "intent-prediction-upsell",
    "group-level-context",
    "edge-pii-masking",
    "risk-profile-gating",
    "content-affinity-engine",
    "paywall-thresholds",
  ];

  it.each(allSlugs)("generates click path for %s", (slug) => {
    const script = generateDemoScript(
      mockInput({ selectedScenarios: [slug] })
    );
    expect(script).toContain("###");
    expect(script).toContain('**"Aha!" Moment:**');
  });

  it("each scenario uses customerName from input", () => {
    const script = generateDemoScript(
      mockInput({
        customerName: "TestCo",
        selectedScenarios: ["second-page-personalization"],
      })
    );
    expect(script).toContain("TestCo");
  });
});
