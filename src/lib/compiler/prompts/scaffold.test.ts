import { describe, it, expect } from "vitest";
import { buildScaffoldPrompt } from "./scaffold";
import { mockCompilerInput } from "@/__test-utils__/fixtures";

describe("buildScaffoldPrompt", () => {
  it("returns title 'Scaffolding & Dependencies'", () => {
    const result = buildScaffoldPrompt(mockCompilerInput());
    expect(result.title).toBe("Scaffolding & Dependencies");
  });

  it("slugifies customer name to lowercase with dashes", () => {
    const result = buildScaffoldPrompt(
      mockCompilerInput({ customerName: "Acme Corp" })
    );
    expect(result.promptText).toContain("acme-corp-demo");
  });

  it("replaces special characters with dashes in the slug", () => {
    const result = buildScaffoldPrompt(
      mockCompilerInput({ customerName: "My @Awesome! Company" })
    );
    expect(result.promptText).toContain("my-awesome-company-demo");
  });

  it("strips leading and trailing dashes from the slug", () => {
    const result = buildScaffoldPrompt(
      mockCompilerInput({ customerName: "---Edge Case---" })
    );
    expect(result.promptText).toContain("edge-case-demo");
    expect(result.promptText).not.toContain("---");
  });

  it("excludes the 'next' package from the dependency list", () => {
    const input = mockCompilerInput();
    expect(input.versions.next).toBeDefined();

    const result = buildScaffoldPrompt(input);
    expect(result.promptText).not.toMatch(/npm install.*next@/);
  });

  it("includes version-pinned dependencies in promptText", () => {
    const input = mockCompilerInput();
    const result = buildScaffoldPrompt(input);

    for (const [pkg, ver] of Object.entries(input.versions)) {
      if (pkg === "next") continue;
      expect(result.promptText).toContain(`${pkg}@${ver}`);
    }
  });

  it("includes ShadCN initialization in promptText", () => {
    const result = buildScaffoldPrompt(mockCompilerInput());
    expect(result.promptText).toContain("npx shadcn@latest init");
  });
});
