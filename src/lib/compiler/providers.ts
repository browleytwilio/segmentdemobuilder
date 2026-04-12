// ---------------------------------------------------------------------------
// Provider Configuration Registry
// Single source of truth for database & auth provider metadata used by the
// wizard UI, validation schemas, sanitizer, template engine, and compiler.
// ---------------------------------------------------------------------------

export type DatabaseProvider = "supabase" | "neon" | "generic-postgres";
export type AuthProvider = "none" | "clerk" | "nextauth" | "supabase-auth";

export interface ProviderCredentialField {
  name: string;
  label: string;
  placeholder: string;
  help: string;
  optional?: boolean;
}

export interface DatabaseProviderConfig {
  id: DatabaseProvider;
  label: string;
  description: string;
  credentialFields: ProviderCredentialField[];
  /** Maps credential store key → environment variable name in the generated demo */
  envVarMap: Record<string, string>;
  /** npm packages the generated demo needs for this provider */
  packages: string[];
  /** Maps credential store key → YOUR_* sanitization placeholder */
  sanitizationEntries: Record<string, string>;
}

export interface AuthProviderConfig {
  id: AuthProvider;
  label: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Database Providers
// ---------------------------------------------------------------------------

export const DATABASE_PROVIDERS: Record<DatabaseProvider, DatabaseProviderConfig> = {
  supabase: {
    id: "supabase",
    label: "Supabase",
    description: "Managed Postgres with client SDK, RLS, and real-time subscriptions",
    credentialFields: [
      {
        name: "supabaseUrl",
        label: "Supabase URL",
        placeholder: "https://xyz.supabase.co",
        help: "Found in Supabase > Project Settings > API > Project URL",
      },
      {
        name: "supabaseAnon",
        label: "Supabase Anon Key",
        placeholder: "eyJ...",
        help: "Found in Supabase > Project Settings > API > anon public key",
      },
    ],
    envVarMap: {
      supabaseUrl: "NEXT_PUBLIC_SUPABASE_URL",
      supabaseAnon: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    },
    packages: ["@supabase/supabase-js", "@supabase/ssr"],
    sanitizationEntries: {
      supabaseUrl: "YOUR_SUPABASE_URL",
      supabaseAnon: "YOUR_SUPABASE_ANON_KEY",
    },
  },

  neon: {
    id: "neon",
    label: "Neon",
    description: "Serverless Postgres with branching, autoscaling, and Drizzle ORM",
    credentialFields: [
      {
        name: "databaseUrl",
        label: "Database URL",
        placeholder: "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb",
        help: "Found in Neon Console > Connection Details > Connection string",
      },
    ],
    envVarMap: {
      databaseUrl: "DATABASE_URL",
    },
    packages: ["@neondatabase/serverless", "drizzle-orm", "drizzle-kit"],
    sanitizationEntries: {
      databaseUrl: "YOUR_DATABASE_URL",
    },
  },

  "generic-postgres": {
    id: "generic-postgres",
    label: "Generic Postgres",
    description: "Standard PostgreSQL with Drizzle ORM — works with any Postgres host",
    credentialFields: [
      {
        name: "databaseUrl",
        label: "Database URL",
        placeholder: "postgresql://user:pass@host:5432/dbname",
        help: "A standard PostgreSQL connection string from your provider",
      },
    ],
    envVarMap: {
      databaseUrl: "DATABASE_URL",
    },
    packages: ["drizzle-orm", "drizzle-kit", "pg", "@types/pg"],
    sanitizationEntries: {
      databaseUrl: "YOUR_DATABASE_URL",
    },
  },
};

// ---------------------------------------------------------------------------
// Auth Providers
// ---------------------------------------------------------------------------

export const AUTH_PROVIDERS: Record<AuthProvider, AuthProviderConfig> = {
  none: {
    id: "none",
    label: "None",
    description: "No authentication — open demo with no login",
  },
  clerk: {
    id: "clerk",
    label: "Clerk",
    description: "Drop-in auth with pre-built UI components and session management",
  },
  nextauth: {
    id: "nextauth",
    label: "NextAuth / Auth.js",
    description: "Flexible auth library with OAuth, credentials, and magic links",
  },
  "supabase-auth": {
    id: "supabase-auth",
    label: "Supabase Auth",
    description: "Built-in auth via Supabase — email/password, OAuth, and magic links",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all credential field names for a database provider */
export function getProviderCredentialNames(provider: DatabaseProvider): string[] {
  return DATABASE_PROVIDERS[provider].credentialFields.map((f) => f.name);
}

/** Build an empty keys object with all Segment fields + provider-specific fields */
export function buildInitialKeys(provider: DatabaseProvider): Record<string, string> {
  const keys: Record<string, string> = {
    segmentWriteFrontend: "",
    segmentWriteBackend: "",
    segmentWorkspace: "",
    segmentProfileToken: "",
  };
  for (const field of DATABASE_PROVIDERS[provider].credentialFields) {
    keys[field.name] = "";
  }
  return keys;
}
