import { describe, it, expect } from "vitest";
import { buildTemplateContext, substituteVariables } from "./template-engine";
import { SANITIZATION_MAP } from "./sanitizer";
import { mockCompilerInput, mockKeys } from "@/__test-utils__/fixtures";

describe("buildTemplateContext", () => {
  it("maps customerName and industry to CUSTOMER_NAME and INDUSTRY", () => {
    const input = mockCompilerInput({
      customerName: "TestCo",
      industry: "Finance",
    });
    const ctx = buildTemplateContext(input);

    expect(ctx.CUSTOMER_NAME).toBe("TestCo");
    expect(ctx.INDUSTRY).toBe("Finance");
  });

  it("maps all credential keys to their context names", () => {
    const keys = mockKeys();
    const ctx = buildTemplateContext(mockCompilerInput({ keys }));

    expect(ctx.SEGMENT_WRITE_KEY).toBe(keys.segmentWriteFrontend);
    expect(ctx.SEGMENT_BACKEND_WRITE_KEY).toBe(keys.segmentWriteBackend);
    expect(ctx.SEGMENT_WORKSPACE_TOKEN).toBe(keys.segmentWorkspace);
    expect(ctx.SEGMENT_PROFILE_TOKEN).toBe(keys.segmentProfileToken);
    expect(ctx.SUPABASE_URL).toBe(keys.supabaseUrl);
    expect(ctx.SUPABASE_ANON_KEY).toBe(keys.supabaseAnon);
  });

  it("uses placeholders from SANITIZATION_MAP when credentials are empty", () => {
    const emptyKeys = mockKeys({
      segmentWriteFrontend: "",
      segmentWriteBackend: "",
      segmentWorkspace: "",
      segmentProfileToken: "",
      supabaseUrl: "",
      supabaseAnon: "",
    });
    const ctx = buildTemplateContext(mockCompilerInput({ keys: emptyKeys }));

    expect(ctx.SEGMENT_WRITE_KEY).toBe(SANITIZATION_MAP.segmentWriteFrontend);
    expect(ctx.SEGMENT_BACKEND_WRITE_KEY).toBe(SANITIZATION_MAP.segmentWriteBackend);
    expect(ctx.SEGMENT_WORKSPACE_TOKEN).toBe(SANITIZATION_MAP.segmentWorkspace);
    expect(ctx.SEGMENT_PROFILE_TOKEN).toBe(SANITIZATION_MAP.segmentProfileToken);
    expect(ctx.SUPABASE_URL).toBe(SANITIZATION_MAP.supabaseUrl);
    expect(ctx.SUPABASE_ANON_KEY).toBe(SANITIZATION_MAP.supabaseAnon);
  });

  it("creates NPM version keys with scope stripped", () => {
    const input = mockCompilerInput({
      versions: { "@segment/analytics-next": "1.76.0" },
    });
    const ctx = buildTemplateContext(input);

    expect(ctx.NPM_ANALYTICS_NEXT_VERSION).toBe("1.76.0");
  });

  it("replaces dots and hyphens with underscores in NPM version keys", () => {
    const input = mockCompilerInput({
      versions: { "framer-motion": "12.38.0" },
    });
    const ctx = buildTemplateContext(input);

    expect(ctx.NPM_FRAMER_MOTION_VERSION).toBe("12.38.0");
  });

  it("uppercases NPM version key names", () => {
    const input = mockCompilerInput({
      versions: { tailwindcss: "4.0.0" },
    });
    const ctx = buildTemplateContext(input);

    expect(ctx.NPM_TAILWINDCSS_VERSION).toBe("4.0.0");
  });

  it("handles scoped packages with dots like @supabase/ssr", () => {
    const input = mockCompilerInput({
      versions: { "@supabase/ssr": "0.10.2" },
    });
    const ctx = buildTemplateContext(input);

    expect(ctx.NPM_SSR_VERSION).toBe("0.10.2");
  });

  it("produces no NPM_ keys when versions is empty", () => {
    const input = mockCompilerInput({ versions: {} });
    const ctx = buildTemplateContext(input);

    const npmKeys = Object.keys(ctx).filter((k) => k.startsWith("NPM_"));
    expect(npmKeys).toHaveLength(0);
  });
});

describe("substituteVariables", () => {
  it("replaces known variables in the template", () => {
    const ctx = { CUSTOMER_NAME: "Acme", INDUSTRY: "Retail" } as ReturnType<typeof buildTemplateContext>;
    const result = substituteVariables(
      "Welcome to {{CUSTOMER_NAME}} in {{INDUSTRY}}!",
      ctx
    );

    expect(result).toBe("Welcome to Acme in Retail!");
  });

  it("leaves unknown variables untouched", () => {
    const ctx = { CUSTOMER_NAME: "Acme" } as ReturnType<typeof buildTemplateContext>;
    const result = substituteVariables("{{CUSTOMER_NAME}} {{UNKNOWN_VAR}}", ctx);

    expect(result).toBe("Acme {{UNKNOWN_VAR}}");
  });

  it("replaces multiple occurrences of the same variable", () => {
    const ctx = { NAME: "Bob" } as ReturnType<typeof buildTemplateContext>;
    const result = substituteVariables("{{NAME}} and {{NAME}}", ctx);

    expect(result).toBe("Bob and Bob");
  });

  it("returns template unchanged when no variables are present", () => {
    const ctx = { CUSTOMER_NAME: "Acme" } as ReturnType<typeof buildTemplateContext>;
    const result = substituteVariables("No placeholders here.", ctx);

    expect(result).toBe("No placeholders here.");
  });

  it("returns empty string when given empty string", () => {
    const ctx = {} as ReturnType<typeof buildTemplateContext>;
    const result = substituteVariables("", ctx);

    expect(result).toBe("");
  });

  it("does not match single-brace patterns like {VAR}", () => {
    const ctx = { VAR: "replaced" } as ReturnType<typeof buildTemplateContext>;
    const result = substituteVariables("{VAR}", ctx);

    expect(result).toBe("{VAR}");
  });

  it("does not match triple-brace patterns like {{{VAR}}}", () => {
    const ctx = { VAR: "replaced" } as ReturnType<typeof buildTemplateContext>;
    const result = substituteVariables("{{{VAR}}}", ctx);

    // Inner {{VAR}} is matched and replaced; outer braces remain
    expect(result).toBe("{replaced}");
  });

  it("handles context values that contain special regex characters", () => {
    const ctx = { URL: "https://example.com?a=1&b=2" } as ReturnType<typeof buildTemplateContext>;
    const result = substituteVariables("Visit {{URL}}", ctx);

    expect(result).toBe("Visit https://example.com?a=1&b=2");
  });
});
