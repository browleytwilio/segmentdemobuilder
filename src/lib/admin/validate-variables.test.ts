import { describe, it, expect } from "vitest";
import { validateTemplateVariables } from "@/lib/admin/validate-variables";

describe("validateTemplateVariables", () => {
  it("returns empty array for content with only valid variables", () => {
    const content = "Hello {{CUSTOMER_NAME}}, welcome to {{INDUSTRY}}.";
    expect(validateTemplateVariables(content)).toEqual([]);
  });

  it("returns invalid variable names", () => {
    const content = "Hello {{INVALID_VAR}}, your key is {{BAD_KEY}}.";
    expect(validateTemplateVariables(content)).toEqual([
      "INVALID_VAR",
      "BAD_KEY",
    ]);
  });

  it("returns empty array for empty content", () => {
    expect(validateTemplateVariables("")).toEqual([]);
  });

  it("returns empty array for content with no variables", () => {
    const content = "This is plain text with no template variables.";
    expect(validateTemplateVariables(content)).toEqual([]);
  });

  it("filters out valid variables and returns only invalid ones", () => {
    const content =
      "Key: {{SEGMENT_WRITE_KEY}}, bad: {{UNKNOWN}}, url: {{SUPABASE_URL}}";
    expect(validateTemplateVariables(content)).toEqual(["UNKNOWN"]);
  });

  it("handles all valid NPM version variables", () => {
    const content = [
      "{{NPM_NEXT_VERSION}}",
      "{{NPM_REACT_VERSION}}",
      "{{NPM_REACT_DOM_VERSION}}",
      "{{NPM_TAILWINDCSS_VERSION}}",
      "{{NPM_FRAMER_MOTION_VERSION}}",
      "{{NPM_ANALYTICS_NEXT_VERSION}}",
      "{{NPM_SUPABASE_JS_VERSION}}",
      "{{NPM_LUCIDE_REACT_VERSION}}",
      "{{NPM_SSR_VERSION}}",
    ].join(" ");
    expect(validateTemplateVariables(content)).toEqual([]);
  });

  it("handles all valid credential variables", () => {
    const content = [
      "{{SEGMENT_WRITE_KEY}}",
      "{{SEGMENT_BACKEND_WRITE_KEY}}",
      "{{SEGMENT_WORKSPACE_TOKEN}}",
      "{{SEGMENT_PROFILE_TOKEN}}",
      "{{SUPABASE_URL}}",
      "{{SUPABASE_ANON_KEY}}",
    ].join(" ");
    expect(validateTemplateVariables(content)).toEqual([]);
  });

  it("handles duplicate invalid variables", () => {
    const content = "{{BAD}} and {{BAD}} again";
    const result = validateTemplateVariables(content);
    expect(result).toEqual(["BAD", "BAD"]);
  });

  it("handles duplicate valid variables without errors", () => {
    const content = "{{CUSTOMER_NAME}} and {{CUSTOMER_NAME}}";
    expect(validateTemplateVariables(content)).toEqual([]);
  });

  it("ignores partial template syntax", () => {
    const content = "This has {SINGLE_BRACE} and {{VALID}} end";
    // {SINGLE_BRACE} is not matched by the regex; only {{VALID}} is
    // but VALID is not in the allowed list
    expect(validateTemplateVariables(content)).toEqual(["VALID"]);
  });
});
