import { z } from "zod";

// ─── Credential Validation Schema ──────────────────────────────────
// Shared between wizard Step 4 (onboarding) and Rehydration Modal (playbook viewer).
// Extracted per PRD 9 §5 to ensure consistent validation across both entry points.

export const baseCredentialsSchema = z.object({
  segmentWriteFrontend: z
    .string()
    .min(10, "Write key must be at least 10 characters"),
  segmentWriteBackend: z.string().optional().or(z.literal("")),
  segmentWorkspace: z
    .string()
    .min(10, "Workspace token must be at least 10 characters"),
  segmentProfileToken: z.string().optional().or(z.literal("")),
  supabaseUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((val) => val.includes(".supabase.co"), {
      message: "Must be a Supabase URL (containing .supabase.co)",
    }),
  supabaseAnon: z.string().refine((val) => val.startsWith("eyJ"), {
    message: "Must be a valid JWT (starts with eyJ)",
  }),
});

/**
 * Creates a credentials schema with conditional validation.
 * When `enableProfileAPI` is true, `segmentProfileToken` becomes required (min 10 chars).
 */
export function createCredentialsSchema(enableProfileAPI: boolean) {
  return baseCredentialsSchema.superRefine((data, ctx) => {
    if (
      enableProfileAPI &&
      (!data.segmentProfileToken || data.segmentProfileToken.length < 10)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Profile token is required when Profile API is enabled (min 10 characters)",
        path: ["segmentProfileToken"],
      });
    }
  });
}

export type CredentialsFormData = z.infer<typeof baseCredentialsSchema>;
