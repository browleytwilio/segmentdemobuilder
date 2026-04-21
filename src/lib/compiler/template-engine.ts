import type { CompilerInput } from "./types";
import { buildSanitizationMap } from "./sanitizer";
import { DATABASE_PROVIDERS, AUTH_PROVIDERS } from "./providers";

export interface TemplateContext {
  CUSTOMER_NAME: string;
  INDUSTRY: string;
  DATABASE_PROVIDER: string;
  AUTH_PROVIDER: string;
  PRODUCT_NAME: string;
  TAGLINE: string;
  PRIMARY_COLOR: string;
  ACCENT_COLOR: string;
  VOICE_TONE: string;
  SEGMENT_WRITE_KEY: string;
  SEGMENT_BACKEND_WRITE_KEY: string;
  SEGMENT_WORKSPACE_TOKEN: string;
  SEGMENT_PROFILE_TOKEN: string;
  [key: string]: string;
}

/**
 * Builds a flat key-value context for template variable substitution.
 * Credentials use keyOrPlaceholder — empty values become YOUR_* placeholders.
 */
export function buildTemplateContext(input: CompilerInput): TemplateContext {
  const sanitizationMap = buildSanitizationMap(input.databaseProvider, input.authProvider);

  function keyOrPlaceholder(value: string | undefined, field: string): string {
    return value || sanitizationMap[field] || "";
  }

  const ctx: TemplateContext = {
    CUSTOMER_NAME: input.customerName,
    INDUSTRY: input.industry,
    DATABASE_PROVIDER: input.databaseProvider,
    AUTH_PROVIDER: input.authProvider,
    PRODUCT_NAME: input.productName || input.customerName,
    TAGLINE: input.tagline || "",
    PRIMARY_COLOR: input.primaryColor || "",
    ACCENT_COLOR: input.accentColor || "",
    VOICE_TONE: input.voiceTone || "",
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
  };

  // Add provider-specific credential context variables
  const providerConfig = DATABASE_PROVIDERS[input.databaseProvider];
  for (const [storeKey, envVar] of Object.entries(providerConfig.envVarMap)) {
    // Template variable name matches the env var name (e.g. SUPABASE_URL, DATABASE_URL)
    const varName = envVar.replace(/^NEXT_PUBLIC_/, "");
    ctx[varName] = keyOrPlaceholder(input.keys[storeKey], storeKey);
  }

  // Add auth provider credential context variables
  const authConfig = AUTH_PROVIDERS[input.authProvider];
  for (const [storeKey, envVar] of Object.entries(authConfig.envVarMap)) {
    const varName = envVar.replace(/^NEXT_PUBLIC_/, "");
    ctx[varName] = keyOrPlaceholder(input.keys[storeKey], storeKey);
  }

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
