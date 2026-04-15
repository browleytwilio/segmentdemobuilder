import type { CompilerInput, CompiledPrompt } from "../types";
import { buildSanitizationMap } from "../sanitizer";
import { DATABASE_PROVIDERS, AUTH_PROVIDERS } from "../providers";

function keyOrPlaceholder(
  value: string | undefined,
  field: string,
  sanitizationMap: Record<string, string>
): string {
  return value || sanitizationMap[field] || "";
}

function missingKeyWarnings(input: CompilerInput): string {
  const warnings: string[] = [];
  const { keys, databaseProvider, authProvider } = input;
  if (!keys.segmentWriteFrontend) warnings.push("segmentWriteFrontend");
  if (!keys.segmentWorkspace) warnings.push("segmentWorkspace");
  // Check provider-specific credential fields
  for (const field of DATABASE_PROVIDERS[databaseProvider].credentialFields) {
    if (!keys[field.name]) warnings.push(field.name);
  }
  for (const field of AUTH_PROVIDERS[authProvider].credentialFields) {
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
// Auth-provider-specific prompt sections
// ---------------------------------------------------------------------------

function buildClerkAuthSection(publishableKey: string, secretKey: string): { envBlock: string; authSetup: string } {
  return {
    envBlock: `
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${publishableKey}
CLERK_SECRET_KEY=${secretKey}`,
    authSetup: `## Auth: Clerk Setup

Install the Clerk middleware. Create \`src/middleware.ts\`:

\`\`\`ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
\`\`\`

Wrap the app with \`ClerkProvider\`. Update \`src/app/layout.tsx\`:

\`\`\`tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
\`\`\`

Add sign-in and sign-up routes:

\`\`\`tsx
// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return <SignIn />;
}

// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return <SignUp />;
}
\`\`\``,
  };
}

function buildNextAuthSection(secret: string): { envBlock: string; authSetup: string } {
  return {
    envBlock: `
# NextAuth / Auth.js
AUTH_SECRET=${secret}`,
    authSetup: `## Auth: NextAuth / Auth.js Setup

Create \`src/auth.ts\`:

\`\`\`ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        // Replace with your user lookup logic
        if (credentials?.email) {
          return { id: "1", email: credentials.email as string };
        }
        return null;
      },
    }),
  ],
});
\`\`\`

Create the API route handler at \`src/app/api/auth/[...nextauth]/route.ts\`:

\`\`\`ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
\`\`\`

Create \`src/middleware.ts\` to protect routes:

\`\`\`ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
\`\`\``,
  };
}

function buildSupabaseAuthSection(): { envBlock: string; authSetup: string } {
  return {
    envBlock: "", // Supabase Auth uses the existing Supabase env vars
    authSetup: `## Auth: Supabase Auth Setup

Supabase Auth uses the same Supabase project URL and anon key already configured above.

Create \`src/lib/supabase/middleware.ts\`:

\`\`\`ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}
\`\`\`

Create \`src/middleware.ts\`:

\`\`\`ts
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
\`\`\`

Create sign-in/sign-up pages using \`supabase.auth.signInWithPassword()\` and \`supabase.auth.signUp()\`.`,
  };
}

function buildBetterAuthSection(secret: string): { envBlock: string; authSetup: string } {
  return {
    envBlock: `
# Better Auth
BETTER_AUTH_SECRET=${secret}
BETTER_AUTH_URL=http://localhost:3000`,
    authSetup: `## Auth: Better Auth Setup

Create the server-side auth configuration at \`src/lib/auth.ts\`:

\`\`\`ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
});
\`\`\`

Create the auth client at \`src/lib/auth-client.ts\`:

\`\`\`ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
\`\`\`

Create the API catch-all route at \`src/app/api/auth/[...all]/route.ts\`:

\`\`\`ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
\`\`\`

Create a basic sign-in page at \`src/app/sign-in/page.tsx\`:

\`\`\`tsx
"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn.email({ email, password });
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 p-8">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border p-2" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded border p-2" />
      <button type="submit" className="w-full rounded bg-primary p-2 text-white">Sign In</button>
    </form>
  );
}
\`\`\``,
  };
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export function buildEnvironmentPrompt(input: CompilerInput): CompiledPrompt {
  const { keys, customerName, databaseProvider, authProvider } = input;
  const sanitizationMap = buildSanitizationMap(databaseProvider, authProvider);
  const providerLabel = DATABASE_PROVIDERS[databaseProvider].label;
  const authLabel = AUTH_PROVIDERS[authProvider].label;

  const writeKey = keyOrPlaceholder(keys.segmentWriteFrontend, "segmentWriteFrontend", sanitizationMap);
  const backendKey = keyOrPlaceholder(keys.segmentWriteBackend, "segmentWriteBackend", sanitizationMap);
  const workspaceToken = keyOrPlaceholder(keys.segmentWorkspace, "segmentWorkspace", sanitizationMap);
  const profileToken = keyOrPlaceholder(keys.segmentProfileToken, "segmentProfileToken", sanitizationMap);

  // Build database-provider-specific sections
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

  // Build auth-provider-specific sections
  let authSections: { envBlock: string; authSetup: string } = { envBlock: "", authSetup: "" };

  switch (authProvider) {
    case "clerk": {
      const pk = keyOrPlaceholder(keys.clerkPublishableKey, "clerkPublishableKey", sanitizationMap);
      const sk = keyOrPlaceholder(keys.clerkSecretKey, "clerkSecretKey", sanitizationMap);
      authSections = buildClerkAuthSection(pk, sk);
      break;
    }
    case "nextauth": {
      const secret = keyOrPlaceholder(keys.authSecret, "authSecret", sanitizationMap);
      authSections = buildNextAuthSection(secret);
      break;
    }
    case "supabase-auth": {
      authSections = buildSupabaseAuthSection();
      break;
    }
    case "better-auth": {
      const secret = keyOrPlaceholder(keys.betterAuthSecret, "betterAuthSecret", sanitizationMap);
      authSections = buildBetterAuthSection(secret);
      break;
    }
    // "none" — no auth setup
  }

  const hasAuth = authProvider !== "none";
  const titleSuffix = hasAuth ? `, and ${authLabel} auth` : "";
  const authSetupBlock = authSections.authSetup ? `\n\n${authSections.authSetup}` : "";

  return {
    stepNumber: 0,
    title: "Environment & Core Providers",
    expectedOutput:
      `A configured .env.local file, Analytics and ${providerLabel} providers${titleSuffix}, and an updated RootLayout.` +
      missingKeyWarnings(input),
    promptText: `# Step: Environment & Core Providers

Set up environment variables and wrap the app with Segment Analytics${hasAuth ? `, ${authLabel} auth,` : ""} and ${providerLabel} database.

## 1. Create \`.env.local\`

\`\`\`bash
cat > .env.local << 'ENVEOF'
# Segment
NEXT_PUBLIC_SEGMENT_WRITE_KEY=${writeKey}
SEGMENT_BACKEND_WRITE_KEY=${backendKey}
SEGMENT_WORKSPACE_TOKEN=${workspaceToken}
SEGMENT_PROFILE_TOKEN=${profileToken}
${dbSections.envBlock}${authSections.envBlock}
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
${authSetupBlock}

## ${hasAuth ? "5" : "4"}. Wrap the RootLayout

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

## ${hasAuth ? "6" : "5"}. Verify

Run \`npm run dev\`, open the browser console, and confirm you see Segment loading (network request to \`cdn.segment.com\`). Verify no errors in the console for the ${customerName} demo.
`,
  };
}
