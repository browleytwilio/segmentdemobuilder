import type { CompilerInput, CompiledPrompt } from "./types";
import { buildScaffoldPrompt } from "./prompts/scaffold";
import { buildEnvironmentPrompt } from "./prompts/environment";
import { buildArchitecturePrompt } from "./prompts/architecture";
import { buildScenarioPrompts } from "./prompts/scenarios";
import { buildTemplateContext, substituteVariables } from "./template-engine";

interface DBTemplate {
  featureId: string;
  slug: string;
  templateName: string;
  content: string;
}

/**
 * Legacy: compiles from hardcoded factory functions.
 * Used as fallback for edge cases.
 */
export function compilePrompts(input: CompilerInput): CompiledPrompt[] {
  const prompts: CompiledPrompt[] = [
    buildScaffoldPrompt(input),
    buildEnvironmentPrompt(input),
    buildArchitecturePrompt(input),
    ...buildScenarioPrompts(input),
  ];

  return prompts.map((prompt, index) => ({
    ...prompt,
    stepNumber: index + 1,
  }));
}

/**
 * DB-driven: compiles foundation/architecture from code + scenarios from DB templates.
 * Scenario templates use {{VARIABLE}} placeholders resolved via substituteVariables().
 */
export function compilePromptsWithTemplates(
  input: CompilerInput,
  dbTemplates: DBTemplate[]
): CompiledPrompt[] {
  const context = buildTemplateContext(input);

  // Foundation + architecture from code (complex conditional logic)
  const codePrompts: CompiledPrompt[] = [
    buildScaffoldPrompt(input),
    buildEnvironmentPrompt(input),
    buildArchitecturePrompt(input),
  ];

  // Scenarios from DB templates
  const scenarioPrompts: CompiledPrompt[] = dbTemplates.map((t) => ({
    stepNumber: 0,
    title: t.templateName,
    expectedOutput: `Completed implementation of the ${t.templateName} scenario for ${input.customerName}.`,
    promptText: substituteVariables(t.content, context),
  }));

  const prompts = [...codePrompts, ...scenarioPrompts];

  return prompts.map((prompt, index) => ({
    ...prompt,
    stepNumber: index + 1,
  }));
}
