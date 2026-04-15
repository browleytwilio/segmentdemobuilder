import { z } from "zod";
import type { DatabaseProvider, AuthProvider } from "@/lib/compiler/providers";

// ─── Segment Credential Fields (shared across all providers) ───────

const segmentFields = {
  segmentWriteFrontend: z
    .string()
    .min(10, "Write key must be at least 10 characters"),
  segmentWriteBackend: z.string().optional().or(z.literal("")),
  segmentWorkspace: z
    .string()
    .min(10, "Workspace token must be at least 10 characters"),
  segmentProfileToken: z.string().optional().or(z.literal("")),
};

// ─── Database-Provider-Specific Fields ─────────────────────────────

const supabaseFields = {
  supabaseUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((val) => val.includes(".supabase.co"), {
      message: "Must be a Supabase URL (containing .supabase.co)",
    }),
  supabaseAnon: z.string().refine((val) => val.startsWith("eyJ"), {
    message: "Must be a valid JWT (starts with eyJ)",
  }),
};

const neonFields = {
  databaseUrl: z
    .string()
    .min(10, "Connection string is required")
    .refine(
      (val) =>
        val.includes("neon.tech") || val.startsWith("postgresql://") || val.startsWith("postgres://"),
      { message: "Must be a Neon or PostgreSQL connection string" }
    ),
};

const genericPostgresFields = {
  databaseUrl: z
    .string()
    .min(10, "Connection string is required")
    .refine(
      (val) => val.startsWith("postgresql://") || val.startsWith("postgres://"),
      { message: "Must be a PostgreSQL connection string (postgresql://...)" }
    ),
};

const DB_FIELDS: Record<DatabaseProvider, Record<string, z.ZodTypeAny>> = {
  supabase: supabaseFields,
  neon: neonFields,
  "generic-postgres": genericPostgresFields,
};

// ─── Auth-Provider-Specific Fields ────────────────────────────────

const clerkFields = {
  clerkPublishableKey: z
    .string()
    .min(5, "Publishable key is required")
    .refine((val) => val.startsWith("pk_"), {
      message: "Must be a Clerk publishable key (starts with pk_)",
    }),
  clerkSecretKey: z
    .string()
    .min(5, "Secret key is required")
    .refine((val) => val.startsWith("sk_"), {
      message: "Must be a Clerk secret key (starts with sk_)",
    }),
};

const nextauthFields = {
  authSecret: z.string().min(10, "Auth secret must be at least 10 characters"),
};

const betterAuthFields = {
  betterAuthSecret: z.string().min(10, "Better Auth secret must be at least 10 characters"),
};

const AUTH_FIELDS: Record<AuthProvider, Record<string, z.ZodTypeAny>> = {
  none: {},
  clerk: clerkFields,
  nextauth: nextauthFields,
  "supabase-auth": {},
  "better-auth": betterAuthFields,
};

// ─── Provider-Aware Schema Factory ─────────────────────────────────

/**
 * Creates a credentials schema dynamically based on the selected database provider.
 * Always includes the 4 Segment fields; database credential fields vary by provider.
 */
export function createProviderCredentialsSchema(
  databaseProvider: DatabaseProvider,
  enableProfileAPI: boolean,
  authProvider: AuthProvider = "none"
) {
  const shape = { ...segmentFields, ...DB_FIELDS[databaseProvider], ...AUTH_FIELDS[authProvider] };
  const schema = z.object(shape);

  return schema.superRefine((data, ctx) => {
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

// ─── Legacy Exports (backward compat) ──────────────────────────────

/** @deprecated Use createProviderCredentialsSchema("supabase", ...) instead */
export const baseCredentialsSchema = z.object({
  ...segmentFields,
  ...supabaseFields,
});

/** @deprecated Use createProviderCredentialsSchema instead */
export function createCredentialsSchema(enableProfileAPI: boolean) {
  return createProviderCredentialsSchema("supabase", enableProfileAPI);
}

export type CredentialsFormData = z.infer<typeof baseCredentialsSchema>;
