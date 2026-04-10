import { describe, it, expect } from "vitest";
import { compilePrompts, compilePromptsWithTemplates } from "./compile";
import {
  mockCompilerInput,
  mockDBTemplate,
} from "@/__test-utils__/fixtures";

describe("compilePrompts", () => {
  it("returns 3 base prompts + N scenario prompts", () => {
    const input = mockCompilerInput({
      selectedScenarios: ["second-page-personalization", "authenticated-vip-state"],
    });
    const result = compilePrompts(input);

    // 3 base (scaffold, environment, architecture) + 2 scenarios
    expect(result).toHaveLength(5);
  });

  it("assigns 1-indexed step numbers", () => {
    const input = mockCompilerInput({ selectedScenarios: [] });
    const result = compilePrompts(input);

    result.forEach((prompt, i) => {
      expect(prompt.stepNumber).toBe(i + 1);
    });
  });

  it("returns exactly 3 prompts when there are no scenarios", () => {
    const input = mockCompilerInput({ selectedScenarios: [] });
    const result = compilePrompts(input);

    expect(result).toHaveLength(3);
  });

  it("includes scaffold, environment, and architecture as the first 3 prompts", () => {
    const input = mockCompilerInput({ selectedScenarios: [] });
    const result = compilePrompts(input);

    expect(result[0].title).toBe("Scaffolding & Dependencies");
    expect(result[1].title).toBe("Environment & Core Providers");
    expect(result[2].title).toBe("Demo Architecture Setup");
  });

  it("skips unknown scenario slugs without throwing", () => {
    const input = mockCompilerInput({
      selectedScenarios: ["nonexistent-scenario"],
    });
    const result = compilePrompts(input);

    // Only the 3 base prompts; the unknown scenario is filtered out
    expect(result).toHaveLength(3);
  });
});

describe("compilePromptsWithTemplates", () => {
  it("combines code prompts with DB template prompts", () => {
    const input = mockCompilerInput();
    const templates = [
      mockDBTemplate({ templateName: "Template A" }),
      mockDBTemplate({ templateName: "Template B" }),
    ];
    const result = compilePromptsWithTemplates(input, templates);

    // 3 code prompts + 2 DB templates
    expect(result).toHaveLength(5);
  });

  it("assigns sequential 1-indexed step numbers across all prompts", () => {
    const input = mockCompilerInput();
    const templates = [mockDBTemplate()];
    const result = compilePromptsWithTemplates(input, templates);

    result.forEach((prompt, i) => {
      expect(prompt.stepNumber).toBe(i + 1);
    });
  });

  it("substitutes template variables in DB template content", () => {
    const input = mockCompilerInput({
      customerName: "MegaCorp",
      industry: "Healthcare",
    });
    const templates = [
      mockDBTemplate({
        content: "Build demo for {{CUSTOMER_NAME}} in {{INDUSTRY}}.",
      }),
    ];
    const result = compilePromptsWithTemplates(input, templates);

    const scenarioPrompt = result[result.length - 1];
    expect(scenarioPrompt.promptText).toBe(
      "Build demo for MegaCorp in Healthcare."
    );
  });

  it("sets expectedOutput including template name and customer name", () => {
    const input = mockCompilerInput({ customerName: "FooCorp" });
    const templates = [
      mockDBTemplate({ templateName: "Cool Feature" }),
    ];
    const result = compilePromptsWithTemplates(input, templates);

    const scenarioPrompt = result[result.length - 1];
    expect(scenarioPrompt.expectedOutput).toBe(
      "Completed implementation of the Cool Feature scenario for FooCorp."
    );
  });

  it("returns only 3 code prompts when dbTemplates is empty", () => {
    const input = mockCompilerInput();
    const result = compilePromptsWithTemplates(input, []);

    expect(result).toHaveLength(3);
    expect(result[0].title).toBe("Scaffolding & Dependencies");
  });
});
