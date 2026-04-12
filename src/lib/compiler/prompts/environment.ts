import type { CompilerInput, CompiledPrompt } from "../types";
import { buildSanitizationMap } from "../sanitizer";
import { DATABASE_PROVIDERS } from "../providers";

function keyOrPlaceholder(
  value: string | undefined,
  field: string,
  sanitizationMap: Record<string, string>
): string {
  return value || sanitizationMap[field] || "";
}

function missingKeyWarnings(input: CompilerInput): string {
  const warnings: string[] = [];
  const { keys, databaseProvider } = input;
  if (!keys.segmentWriteFrontend) warnings.push("segmentWriteFrontend");
  if (!keys.segmentWorkspace) warnings.push("segmentWorkspace");
  // Check provider-specific credential fields
  for (const field of DATABASE_PROVIDERS[databaseProvider].credentialFields) {
    if (!keys[field.name]) warnings.push(field.name);
  }
  if (warnings.length === 0) return "";
  return ` WARNING: The following keys were not provided and use placeholders: ${warnings.join(", ")}. Replace them before running this prompt.`;
}

// ---------------------------------------------------------------------------
// Database-specific prompt sections
// ---------------------------------------------------------------------------

function buildSupabaseSection(supabaseUrl: string, supabaseAnon: string): { envBlock: string; clientSetup: string } {
  return {
    envBlock: `
# Supabase
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnon}`,
    clientSetup: `## 3. Create the Supabase Client

Create \`src/lib/supabase/client.ts\`:

\`\`\`tsx
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { isSingleton: true }
  );
}
\`\`\``,
  };
}

function buildNeonSection(databaseUrl: string): { envBlock: string; clientSetup: string } {
  return {
    envBlock: `
# Neon Postgres
DATABASE_URL=${databaseUrl}`,
    clientSetup: `## 3. Create the Database Client

Create \`src/lib/db/index.ts\`:

\`\`\`ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
\`\`\`

Create \`drizzle.config.ts\` in the project root:

\`\`\`ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
\`\`\`

Create an empty schema file at \`src/lib/db/schema.ts\`:

\`\`\`ts
// Define your tables here using Drizzle ORM
// import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
\`\`\``,
  };
}

function buildGenericPostgresSection(databaseUrl: string): { envBlock: string; clientSetup: string } {
  return {
    envBlock: `
# Postgres
DATABASE_URL=${databaseUrl}`,
    clientSetup: `## 3. Create the Database Client

Create \`src/lib/db/index.ts\`:

\`\`\`ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle({ client: pool });
\`\`\`

Create \`drizzle.config.ts\` in the project root:

\`\`\`ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
\`\`\`

Create an empty schema file at \`src/lib/db/schema.ts\`:

\`\`\`ts
// Define your tables here using Drizzle ORM
// import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
\`\`\``,
  };
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export function buildEnvironmentPrompt(input: CompilerInput): CompiledPrompt {
  const { keys, customerName, databaseProvider } = input;
  const sanitizationMap = buildSanitizationMap(databaseProvider);
  const providerLabel = DATABASE_PROVIDERS[databaseProvider].label;

  const writeKey = keyOrPlaceholder(keys.segmentWriteFrontend, "segmentWriteFrontend", sanitizationMap);
  const backendKey = keyOrPlaceholder(keys.segmentWriteBackend, "segmentWriteBackend", sanitizationMap);
  const workspaceToken = keyOrPlaceholder(keys.segmentWorkspace, "segmentWorkspace", sanitizationMap);
  const profileToken = keyOrPlaceholder(keys.segmentProfileToken, "segmentProfileToken", sanitizationMap);

  // Build provider-specific sections
  let dbSections: { envBlock: string; clientSetup: string };

  switch (databaseProvider) {
    case "neon": {
      const url = keyOrPlaceholder(keys.databaseUrl, "databaseUrl", sanitizationMap);
      dbSections = buildNeonSection(url);
      break;
    }
    case "generic-postgres": {
      const url = keyOrPlaceholder(keys.databaseUrl, "databaseUrl", sanitizationMap);
      dbSections = buildGenericPostgresSection(url);
      break;
    }
    default: {
      const url = keyOrPlaceholder(keys.supabaseUrl, "supabaseUrl", sanitizationMap);
      const anon = keyOrPlaceholder(keys.supabaseAnon, "supabaseAnon", sanitizationMap);
      dbSections = buildSupabaseSection(url, anon);
      break;
    }
  }

  return {
    stepNumber: 0,
    title: "Environment & Core Providers",
    expectedOutput:
      `A configured .env.local file, Analytics and ${providerLabel} providers, and an updated RootLayout.` +
      missingKeyWarnings(input),
    promptText: `# Step: Environment & Core Providers

Set up environment variables and wrap the app with Segment Analytics and ${providerLabel} database.

## 1. Create \`.env.local\`

\`\`\`bash
cat > .env.local << 'ENVEOF'
# Segment
NEXT_PUBLIC_SEGMENT_WRITE_KEY=${writeKey}
SEGMENT_BACKEND_WRITE_KEY=${backendKey}
SEGMENT_WORKSPACE_TOKEN=${workspaceToken}
SEGMENT_PROFILE_TOKEN=${profileToken}
${dbSections.envBlock}
ENVEOF
\`\`\`

## 2. Create the Analytics Provider

Create \`src/components/providers/analytics-provider.tsx\`:

\`\`\`tsx
"use client";

import { useEffect } from "react";
import { AnalyticsBrowser } from "@segment/analytics-next";

export const analytics = AnalyticsBrowser.load({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
});

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    analytics.page();
  }, []);

  return <>{children}</>;
}
\`\`\`

${dbSections.clientSetup}

## 4. Wrap the RootLayout

Update \`src/app/layout.tsx\` to wrap children with both providers:

\`\`\`tsx
import { AnalyticsProvider } from "@/components/providers/analytics-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
\`\`\`

## 5. Verify

Run \`npm run dev\`, open the browser console, and confirm you see Segment loading (network request to \`cdn.segment.com\`). Verify no errors in the console for the ${customerName} demo.
`,
  };
}
