import type { CompilerInput } from "./types";
import { SANITIZATION_MAP } from "./sanitizer";

export interface TemplateContext {
  CUSTOMER_NAME: string;
  INDUSTRY: string;
  SEGMENT_WRITE_KEY: string;
  SEGMENT_BACKEND_WRITE_KEY: string;
  SEGMENT_WORKSPACE_TOKEN: string;
  SEGMENT_PROFILE_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  [key: string]: string;
}

function keyOrPlaceholder(
  value: string,
  field: keyof typeof SANITIZATION_MAP
): string {
  return value || SANITIZATION_MAP[field];
}

/**
 * Builds a flat key-value context for template variable substitution.
 * Credentials use keyOrPlaceholder — empty values become YOUR_* placeholders.
 */
export function buildTemplateContext(input: CompilerInput): TemplateContext {
  const ctx: TemplateContext = {
    CUSTOMER_NAME: input.customerName,
    INDUSTRY: input.industry,
    SEGMENT_WRITE_KEY: keyOrPlaceholder(
      input.keys.segmentWriteFrontend,
      "segmentWriteFrontend"
    ),
    SEGMENT_BACKEND_WRITE_KEY: keyOrPlaceholder(
      input.keys.segmentWriteBackend,
      "segmentWriteBackend"
    ),
    SEGMENT_WORKSPACE_TOKEN: keyOrPlaceholder(
      input.keys.segmentWorkspace,
      "segmentWorkspace"
    ),
    SEGMENT_PROFILE_TOKEN: keyOrPlaceholder(
      input.keys.segmentProfileToken,
      "segmentProfileToken"
    ),
    SUPABASE_URL: keyOrPlaceholder(input.keys.supabaseUrl, "supabaseUrl"),
    SUPABASE_ANON_KEY: keyOrPlaceholder(input.keys.supabaseAnon, "supabaseAnon"),
  };

  // Add NPM version variables
  for (const [pkg, ver] of Object.entries(input.versions)) {
    const cleanPkg = pkg.replace(/^@[^/]+\//, ""); // strip @scope/ prefix
    const varName = `NPM_${cleanPkg.replace(/[.-]/g, "_").toUpperCase()}_VERSION`;
    ctx[varName] = ver;
  }

  return ctx;
}

/**
 * Replaces {{VARIABLE_NAME}} placeholders in a template string.
 * Unknown variables are left as-is (safe because admin editor validates on save).
 */
export function substituteVariables(
  template: string,
  context: TemplateContext
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName: string) => {
    return varName in context ? context[varName] : match;
  });
}
