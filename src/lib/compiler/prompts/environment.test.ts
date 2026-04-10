import { describe, it, expect } from "vitest";
import { buildEnvironmentPrompt } from "./environment";
import { mockCompilerInput, mockKeys } from "@/__test-utils__/fixtures";

describe("buildEnvironmentPrompt", () => {
  it("returns title 'Environment & Core Providers'", () => {
    const result = buildEnvironmentPrompt(mockCompilerInput());
    expect(result.title).toBe("Environment & Core Providers");
  });

  it("uses real credential values when all keys are provided", () => {
    const keys = mockKeys();
    const result = buildEnvironmentPrompt(mockCompilerInput({ keys }));

    expect(result.promptText).toContain(keys.segmentWriteFrontend);
    expect(result.promptText).toContain(keys.segmentWriteBackend);
    expect(result.promptText).toContain(keys.segmentWorkspace);
    expect(result.promptText).toContain(keys.segmentProfileToken);
    expect(result.promptText).toContain(keys.supabaseUrl);
    expect(result.promptText).toContain(keys.supabaseAnon);
  });

  it("uses placeholders when credential values are empty", () => {
    const keys = mockKeys({
      segmentWriteFrontend: "",
      segmentWriteBackend: "",
      segmentWorkspace: "",
      segmentProfileToken: "",
      supabaseUrl: "",
      supabaseAnon: "",
    });
    const result = buildEnvironmentPrompt(mockCompilerInput({ keys }));

    expect(result.promptText).toContain("YOUR_SEGMENT_WRITE_KEY");
    expect(result.promptText).toContain("YOUR_SEGMENT_BACKEND_WRITE_KEY");
    expect(result.promptText).toContain("YOUR_SEGMENT_WORKSPACE_TOKEN");
    expect(result.promptText).toContain("YOUR_SEGMENT_PROFILE_TOKEN");
    expect(result.promptText).toContain("YOUR_SUPABASE_URL");
    expect(result.promptText).toContain("YOUR_SUPABASE_ANON_KEY");
  });

  it("includes missing key warnings in expectedOutput for required keys", () => {
    const keys = mockKeys({
      segmentWriteFrontend: "",
      supabaseUrl: "",
      supabaseAnon: "",
      segmentWorkspace: "",
    });
    const result = buildEnvironmentPrompt(mockCompilerInput({ keys }));

    expect(result.expectedOutput).toContain("WARNING");
    expect(result.expectedOutput).toContain("segmentWriteFrontend");
    expect(result.expectedOutput).toContain("supabaseUrl");
    expect(result.expectedOutput).toContain("supabaseAnon");
    expect(result.expectedOutput).toContain("segmentWorkspace");
  });

  it("does not include warnings when all required keys are present", () => {
    const result = buildEnvironmentPrompt(mockCompilerInput({ keys: mockKeys() }));
    expect(result.expectedOutput).not.toContain("WARNING");
  });

  it("includes Analytics and Supabase provider code in promptText", () => {
    const result = buildEnvironmentPrompt(mockCompilerInput());
    expect(result.promptText).toContain("AnalyticsProvider");
    expect(result.promptText).toContain("createBrowserClient");
  });
});
