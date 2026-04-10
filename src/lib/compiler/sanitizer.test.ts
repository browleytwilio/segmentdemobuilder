import { describe, it, expect } from "vitest";
import { SANITIZATION_MAP, sanitizePrompts } from "./sanitizer";
import { mockKeys, mockCompiledPrompt } from "@/__test-utils__/fixtures";

describe("SANITIZATION_MAP", () => {
  it("has exactly 6 entries", () => {
    expect(Object.keys(SANITIZATION_MAP)).toHaveLength(6);
  });

  it("every placeholder starts with YOUR_", () => {
    for (const placeholder of Object.values(SANITIZATION_MAP)) {
      expect(placeholder).toMatch(/^YOUR_/);
    }
  });

  it("covers all expected key fields", () => {
    const expectedFields = [
      "segmentWriteFrontend",
      "segmentWriteBackend",
      "segmentWorkspace",
      "segmentProfileToken",
      "supabaseUrl",
      "supabaseAnon",
    ];
    expect(Object.keys(SANITIZATION_MAP).sort()).toEqual(expectedFields.sort());
  });
});

describe("sanitizePrompts", () => {
  it("replaces all 6 credential types in prompt text", () => {
    const keys = mockKeys();
    const prompt = mockCompiledPrompt({
      promptText: [
        keys.segmentWriteFrontend,
        keys.segmentWriteBackend,
        keys.segmentWorkspace,
        keys.segmentProfileToken,
        keys.supabaseUrl,
        keys.supabaseAnon,
      ].join(" | "),
    });

    const [sanitized] = sanitizePrompts([prompt], keys);

    expect(sanitized.promptText).toBe(
      Object.values(SANITIZATION_MAP).join(" | ")
    );
  });

  it("does not mutate original prompts", () => {
    const keys = mockKeys();
    const original = mockCompiledPrompt({
      promptText: `Key: ${keys.segmentWriteFrontend}`,
    });
    const originalText = original.promptText;

    sanitizePrompts([original], keys);

    expect(original.promptText).toBe(originalText);
  });

  it("skips replacement when a key value is empty", () => {
    const keys = mockKeys({ segmentWriteFrontend: "" });
    const prompt = mockCompiledPrompt({
      promptText: "No real key here",
    });

    const [sanitized] = sanitizePrompts([prompt], keys);

    expect(sanitized.promptText).toBe("No real key here");
  });

  it("returns text unchanged when no credentials appear", () => {
    const keys = mockKeys();
    const prompt = mockCompiledPrompt({
      promptText: "Just some regular text with no secrets.",
    });

    const [sanitized] = sanitizePrompts([prompt], keys);

    expect(sanitized.promptText).toBe("Just some regular text with no secrets.");
  });

  it("replaces multiple occurrences of the same credential", () => {
    const keys = mockKeys();
    const prompt = mockCompiledPrompt({
      promptText: `${keys.supabaseUrl} and again ${keys.supabaseUrl}`,
    });

    const [sanitized] = sanitizePrompts([prompt], keys);

    expect(sanitized.promptText).toBe(
      `${SANITIZATION_MAP.supabaseUrl} and again ${SANITIZATION_MAP.supabaseUrl}`
    );
  });

  it("preserves all fields other than promptText", () => {
    const keys = mockKeys();
    const prompt = mockCompiledPrompt({
      stepNumber: 5,
      title: "My Title",
      expectedOutput: "Expected output",
      promptText: `Use ${keys.segmentWriteFrontend}`,
    });

    const [sanitized] = sanitizePrompts([prompt], keys);

    expect(sanitized.stepNumber).toBe(5);
    expect(sanitized.title).toBe("My Title");
    expect(sanitized.expectedOutput).toBe("Expected output");
  });

  it("returns an empty array when given an empty array", () => {
    const result = sanitizePrompts([], mockKeys());
    expect(result).toEqual([]);
  });
});
