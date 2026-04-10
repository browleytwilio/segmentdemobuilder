import { describe, it, expect } from "vitest";
import { buildArchitecturePrompt } from "./architecture";
import {
  mockCompilerInput,
  mockArchitecture,
} from "@/__test-utils__/fixtures";

describe("buildArchitecturePrompt", () => {
  it("includes 'Source Engine Sidebar' block when enableSESidebar is true", () => {
    const input = mockCompilerInput({
      architecture: mockArchitecture({
        enableSESidebar: true,
        enableSeededProfiles: false,
        enableProfileAPI: false,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      }),
    });
    const result = buildArchitecturePrompt(input);
    expect(result.promptText).toContain("Source Engine Sidebar");
  });

  it("includes 'Seeded Profiles' block when enableSeededProfiles is true", () => {
    const input = mockCompilerInput({
      architecture: mockArchitecture({
        enableSESidebar: false,
        enableSeededProfiles: true,
        enableProfileAPI: false,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      }),
    });
    const result = buildArchitecturePrompt(input);
    expect(result.promptText).toContain("Seeded Profiles");
  });

  it("includes 'Profile API' block when enableProfileAPI is true", () => {
    const input = mockCompilerInput({
      architecture: mockArchitecture({
        enableSESidebar: false,
        enableSeededProfiles: false,
        enableProfileAPI: true,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      }),
    });
    const result = buildArchitecturePrompt(input);
    expect(result.promptText).toContain("Profile API");
  });

  it("includes 'Intent Predictions' block when enableIntentPredictions is true", () => {
    const input = mockCompilerInput({
      architecture: mockArchitecture({
        enableSESidebar: false,
        enableSeededProfiles: false,
        enableProfileAPI: false,
        enableIntentPredictions: true,
        enableSecondPagePers: false,
      }),
    });
    const result = buildArchitecturePrompt(input);
    expect(result.promptText).toContain("Intent Predictions");
  });

  it("includes 'Second-Page Personalization' block when enableSecondPagePers is true", () => {
    const input = mockCompilerInput({
      architecture: mockArchitecture({
        enableSESidebar: false,
        enableSeededProfiles: false,
        enableProfileAPI: false,
        enableIntentPredictions: false,
        enableSecondPagePers: true,
      }),
    });
    const result = buildArchitecturePrompt(input);
    expect(result.promptText).toContain("Second-Page Personalization Detection");
  });

  it("outputs 'No optional architecture features' when all flags are false", () => {
    const input = mockCompilerInput({
      architecture: mockArchitecture({
        enableSESidebar: false,
        enableSeededProfiles: false,
        enableProfileAPI: false,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      }),
    });
    const result = buildArchitecturePrompt(input);
    expect(result.promptText).toContain("No optional architecture features");
  });

  it("lists enabled features in expectedOutput when flags are set", () => {
    const input = mockCompilerInput({
      architecture: mockArchitecture({
        enableSESidebar: true,
        enableSeededProfiles: false,
        enableProfileAPI: true,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      }),
    });
    const result = buildArchitecturePrompt(input);
    expect(result.expectedOutput).toContain("SE Sidebar");
    expect(result.expectedOutput).toContain("Profile API");
    expect(result.expectedOutput).not.toContain("Seeded Profiles");
  });

  it("says 'can be skipped' in expectedOutput when no features are enabled", () => {
    const input = mockCompilerInput({
      architecture: mockArchitecture({
        enableSESidebar: false,
        enableSeededProfiles: false,
        enableProfileAPI: false,
        enableIntentPredictions: false,
        enableSecondPagePers: false,
      }),
    });
    const result = buildArchitecturePrompt(input);
    expect(result.expectedOutput).toContain("can be skipped");
  });
});
