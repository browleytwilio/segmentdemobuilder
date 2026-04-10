import type { BuilderState } from "@/lib/stores/builder-store";
import type { CompiledPrompt } from "./types";

export const SANITIZATION_MAP: Record<keyof BuilderState["keys"], string> = {
  segmentWriteFrontend: "YOUR_SEGMENT_WRITE_KEY",
  segmentWriteBackend: "YOUR_SEGMENT_BACKEND_WRITE_KEY",
  segmentWorkspace: "YOUR_SEGMENT_WORKSPACE_TOKEN",
  segmentProfileToken: "YOUR_SEGMENT_PROFILE_TOKEN",
  supabaseUrl: "YOUR_SUPABASE_URL",
  supabaseAnon: "YOUR_SUPABASE_ANON_KEY",
};

/**
 * Replaces real credential values in promptText with placeholders.
 * Returns a new array (deep clone) — does not mutate the input.
 */
export function sanitizePrompts(
  prompts: CompiledPrompt[],
  keys: BuilderState["keys"]
): CompiledPrompt[] {
  return prompts.map((prompt) => {
    let sanitized = prompt.promptText;
    for (const [keyField, placeholder] of Object.entries(SANITIZATION_MAP)) {
      const realValue = keys[keyField as keyof BuilderState["keys"]];
      if (realValue) {
        sanitized = sanitized.replaceAll(realValue, placeholder);
      }
    }
    return { ...prompt, promptText: sanitized };
  });
}
