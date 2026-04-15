import type { CompiledPrompt } from "./types";
import type { DatabaseProvider, AuthProvider } from "./providers";
import { DATABASE_PROVIDERS, AUTH_PROVIDERS } from "./providers";

const SEGMENT_SANITIZATION: Record<string, string> = {
  segmentWriteFrontend: "YOUR_SEGMENT_WRITE_KEY",
  segmentWriteBackend: "YOUR_SEGMENT_BACKEND_WRITE_KEY",
  segmentWorkspace: "YOUR_SEGMENT_WORKSPACE_TOKEN",
  segmentProfileToken: "YOUR_SEGMENT_PROFILE_TOKEN",
};

/**
 * Builds a sanitization map for the given database provider.
 * Merges the 4 fixed Segment entries with the provider's credential placeholders.
 */
export function buildSanitizationMap(
  databaseProvider: DatabaseProvider,
  authProvider: AuthProvider = "none"
): Record<string, string> {
  return {
    ...SEGMENT_SANITIZATION,
    ...DATABASE_PROVIDERS[databaseProvider].sanitizationEntries,
    ...AUTH_PROVIDERS[authProvider].sanitizationEntries,
  };
}

/** @deprecated Backward-compat alias — equivalent to buildSanitizationMap("supabase") */
export const SANITIZATION_MAP = buildSanitizationMap("supabase");

/**
 * Replaces real credential values in promptText with placeholders.
 * Returns a new array (deep clone) — does not mutate the input.
 */
export function sanitizePrompts(
  prompts: CompiledPrompt[],
  keys: Record<string, string>,
  databaseProvider: DatabaseProvider = "supabase",
  authProvider: AuthProvider = "none"
): CompiledPrompt[] {
  const map = buildSanitizationMap(databaseProvider, authProvider);
  return prompts.map((prompt) => {
    let sanitized = prompt.promptText;
    for (const [keyField, placeholder] of Object.entries(map)) {
      const realValue = keys[keyField];
      if (realValue) {
        sanitized = sanitized.replaceAll(realValue, placeholder);
      }
    }
    return { ...prompt, promptText: sanitized };
  });
}
