import { describe, it, expect } from "vitest";
import { buildScenarioPrompts } from "./scenarios";
import { mockCompilerInput } from "@/__test-utils__/fixtures";

// Access the registry indirectly by importing the module
// and exercising buildScenarioPrompts with known IDs.
const ALL_SCENARIO_IDS = [
  "second-page-personalization",
  "authenticated-vip-state",
  "cart-abandonment-recovery",
  "intent-prediction-upsell",
  "group-level-context",
  "edge-pii-masking",
  "risk-profile-gating",
  "content-affinity-engine",
  "paywall-thresholds",
] as const;

describe("SCENARIO_REGISTRY", () => {
  it("has exactly 9 entries", () => {
    const input = mockCompilerInput({
      selectedScenarios: [...ALL_SCENARIO_IDS],
    });
    const prompts = buildScenarioPrompts(input);
    expect(prompts).toHaveLength(9);
  });

  it.each(ALL_SCENARIO_IDS)(
    "entry '%s' produces a prompt with title, expectedOutput, and promptText",
    (scenarioId) => {
      const input = mockCompilerInput({
        selectedScenarios: [scenarioId],
      });
      const [prompt] = buildScenarioPrompts(input);
      expect(prompt.title).toBeTruthy();
      expect(prompt.expectedOutput).toBeTruthy();
      expect(prompt.promptText).toBeTruthy();
    }
  );
});

describe("buildScenarioPrompts", () => {
  it("returns prompts only for valid scenario IDs", () => {
    const input = mockCompilerInput({
      selectedScenarios: [
        "second-page-personalization",
        "cart-abandonment-recovery",
      ],
    });
    const prompts = buildScenarioPrompts(input);
    expect(prompts).toHaveLength(2);
    expect(prompts[0].title).toBe("Second-Page Personalization");
    expect(prompts[1].title).toBe("Cart Abandonment Recovery");
  });

  it("filters out unknown scenario IDs", () => {
    const input = mockCompilerInput({
      selectedScenarios: [
        "second-page-personalization",
        "nonexistent-scenario",
        "also-fake",
      ],
    });
    const prompts = buildScenarioPrompts(input);
    expect(prompts).toHaveLength(1);
    expect(prompts[0].title).toBe("Second-Page Personalization");
  });

  it("returns an empty array when selectedScenarios is empty", () => {
    const input = mockCompilerInput({ selectedScenarios: [] });
    const prompts = buildScenarioPrompts(input);
    expect(prompts).toEqual([]);
  });

  it("sets stepNumber to 0 for all returned prompts", () => {
    const input = mockCompilerInput({
      selectedScenarios: [...ALL_SCENARIO_IDS],
    });
    const prompts = buildScenarioPrompts(input);
    for (const prompt of prompts) {
      expect(prompt.stepNumber).toBe(0);
    }
  });

  it("passes the full input to buildPromptText (customer name appears in output)", () => {
    const input = mockCompilerInput({
      customerName: "TestCo Global",
      selectedScenarios: ["second-page-personalization"],
    });
    const [prompt] = buildScenarioPrompts(input);
    expect(prompt.promptText).toContain("TestCo Global");
  });
});
