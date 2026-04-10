import type { CompilerInput, CompiledPrompt } from "../types";
import { SANITIZATION_MAP } from "../sanitizer";

function keyOrPlaceholder(
  value: string,
  field: keyof typeof SANITIZATION_MAP
): string {
  return value || SANITIZATION_MAP[field];
}

function missingKeyWarnings(input: CompilerInput): string {
  const warnings: string[] = [];
  const { keys } = input;
  if (!keys.segmentWriteFrontend) warnings.push("segmentWriteFrontend");
  if (!keys.supabaseUrl) warnings.push("supabaseUrl");
  if (!keys.supabaseAnon) warnings.push("supabaseAnon");
  if (!keys.segmentWorkspace) warnings.push("segmentWorkspace");
  if (warnings.length === 0) return "";
  return ` WARNING: The following keys were not provided and use placeholders: ${warnings.join(", ")}. Replace them before running this prompt.`;
}

export function buildEnvironmentPrompt(input: CompilerInput): CompiledPrompt {
  const { keys, customerName } = input;

  const writeKey = keyOrPlaceholder(
    keys.segmentWriteFrontend,
    "segmentWriteFrontend"
  );
  const backendKey = keyOrPlaceholder(
    keys.segmentWriteBackend,
    "segmentWriteBackend"
  );
  const workspaceToken = keyOrPlaceholder(
    keys.segmentWorkspace,
    "segmentWorkspace"
  );
  const profileToken = keyOrPlaceholder(
    keys.segmentProfileToken,
    "segmentProfileToken"
  );
  const supabaseUrl = keyOrPlaceholder(keys.supabaseUrl, "supabaseUrl");
  const supabaseAnon = keyOrPlaceholder(keys.supabaseAnon, "supabaseAnon");

  return {
    stepNumber: 0,
    title: "Environment & Core Providers",
    expectedOutput:
      "A configured .env.local file, Analytics and Supabase providers, and an updated RootLayout." +
      missingKeyWarnings(input),
    promptText: `# Step: Environment & Core Providers

Set up environment variables and wrap the app with Segment Analytics and Supabase providers.

## 1. Create \`.env.local\`

\`\`\`bash
cat > .env.local << 'ENVEOF'
# Segment
NEXT_PUBLIC_SEGMENT_WRITE_KEY=${writeKey}
SEGMENT_BACKEND_WRITE_KEY=${backendKey}
SEGMENT_WORKSPACE_TOKEN=${workspaceToken}
SEGMENT_PROFILE_TOKEN=${profileToken}

# Supabase
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnon}
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

## 3. Create the Supabase Client

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
\`\`\`

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
