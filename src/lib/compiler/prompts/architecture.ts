import type { CompilerInput, CompiledPrompt } from "../types";

export function buildArchitecturePrompt(input: CompilerInput): CompiledPrompt {
  const { architecture, customerName, industry } = input;
  const blocks: string[] = [];

  if (architecture.enableSESidebar) {
    blocks.push(`## Source Engine Sidebar

Create a fixed sidebar component at \`src/components/debug/se-sidebar.tsx\` that displays a real-time event stream. This is a developer-facing debug panel that shows every Segment call as it fires.

\`\`\`tsx
"use client";

import { useEffect, useState } from "react";
import { analytics } from "@/components/providers/analytics-provider";

interface EventEntry {
  id: string;
  type: string;
  name: string;
  timestamp: string;
  properties: Record<string, unknown>;
}

export function SESidebar() {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Subscribe to all analytics events via the .on() middleware
    const unsubscribe = analytics.on("track", (event, properties) => {
      setEvents((prev) => [
        { id: crypto.randomUUID(), type: "track", name: String(event), timestamp: new Date().toISOString(), properties: properties as Record<string, unknown> },
        ...prev.slice(0, 49),
      ]);
    });
    return () => { unsubscribe(); };
  }, []);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
        SE
      </button>
    );
  }

  return (
    <aside className="fixed right-0 top-0 z-50 h-screen w-80 border-l bg-background p-4 overflow-y-auto shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Source Engine</h3>
        <button onClick={() => setIsOpen(false)} className="text-xs text-muted-foreground">Close</button>
      </div>
      <div className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="rounded border p-2 text-xs">
            <span className="font-mono font-bold">{e.type}</span>: {e.name}
            <pre className="mt-1 text-muted-foreground overflow-x-auto">{JSON.stringify(e.properties, null, 2)}</pre>
          </div>
        ))}
        {events.length === 0 && <p className="text-xs text-muted-foreground">No events yet. Interact with the demo to see events appear here.</p>}
      </div>
    </aside>
  );
}
\`\`\`

Add \`<SESidebar />\` to the RootLayout so it renders on every page.`);
  }

  if (architecture.enableSeededProfiles) {
    blocks.push(`## Seeded Profiles

Create \`src/lib/mockData.ts\` with realistic ${industry} profile data that will be used to pre-populate the demo with Segment Unify profiles.

\`\`\`ts
export const seededProfiles = [
  {
    userId: "demo-user-001",
    traits: {
      name: "Alex Johnson",
      email: "alex@${customerName.toLowerCase().replace(/\s+/g, "")}.com",
      industry: "${industry}",
      plan: "Enterprise",
      lifetime_value: 12400,
      last_seen: new Date().toISOString(),
      created_at: "2024-01-15T00:00:00Z",
    },
  },
  {
    userId: "demo-user-002",
    traits: {
      name: "Sam Rivera",
      email: "sam@${customerName.toLowerCase().replace(/\s+/g, "")}.com",
      industry: "${industry}",
      plan: "Pro",
      lifetime_value: 3200,
      last_seen: new Date().toISOString(),
      created_at: "2024-06-20T00:00:00Z",
    },
  },
  {
    userId: "demo-user-003",
    traits: {
      name: "Jordan Lee",
      email: "jordan@${customerName.toLowerCase().replace(/\s+/g, "")}.com",
      industry: "${industry}",
      plan: "Free",
      lifetime_value: 0,
      last_seen: new Date().toISOString(),
      created_at: "2025-01-10T00:00:00Z",
    },
  },
];
\`\`\`

Create a seed script at \`src/lib/seedProfiles.ts\` that calls \`analytics.identify()\` for each profile:

\`\`\`ts
import { analytics } from "@/components/providers/analytics-provider";
import { seededProfiles } from "./mockData";

export async function seedAllProfiles() {
  for (const profile of seededProfiles) {
    await analytics.identify(profile.userId, profile.traits);
  }
  console.log(\`Seeded \${seededProfiles.length} profiles into Segment.\`);
}
\`\`\``);
  }

  if (architecture.enableProfileAPI) {
    blocks.push(`## Profile API Client

Create \`src/lib/segment/profile-api.ts\` — a utility that fetches real-time traits from the Segment Profile API.

\`\`\`ts
const PROFILE_API_BASE = "https://profiles.segment.com/v1/spaces";

export async function getProfileTraits(userId: string): Promise<Record<string, unknown>> {
  const spaceId = process.env.SEGMENT_WORKSPACE_TOKEN;
  const token = process.env.SEGMENT_PROFILE_TOKEN;

  const res = await fetch(
    \`\${PROFILE_API_BASE}/\${spaceId}/collections/users/profiles/user_id:\${userId}/traits\`,
    {
      headers: {
        Authorization: \`Basic \${btoa(token + ":")}\`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 },
    }
  );

  if (!res.ok) throw new Error(\`Profile API error: \${res.status}\`);
  const data = await res.json();
  return data.traits ?? {};
}
\`\`\`

This runs server-side (Route Handler or Server Component) to keep the Profile API token secret.`);
  }

  if (architecture.enableIntentPredictions) {
    blocks.push(`## Intent Predictions

Create \`src/lib/segment/predictions.ts\` — a utility that reads Segment Predictions traits from a user profile and returns intent scores.

\`\`\`ts
import { getProfileTraits } from "./profile-api";

export interface PredictionScores {
  likelihood_to_purchase: number;
  likelihood_to_churn: number;
  predicted_ltv: number;
}

export async function getIntentPredictions(userId: string): Promise<PredictionScores> {
  const traits = await getProfileTraits(userId);
  return {
    likelihood_to_purchase: Number(traits.likelihood_to_purchase ?? 0),
    likelihood_to_churn: Number(traits.likelihood_to_churn ?? 0),
    predicted_ltv: Number(traits.predicted_ltv ?? 0),
  };
}
\`\`\`

Use these scores in the demo to conditionally show UI elements (e.g., upsell banners for high-intent users, retention offers for high-churn users).`);
  }

  if (architecture.enableSecondPagePers) {
    blocks.push(`## Second-Page Personalization Detection

Create \`src/lib/personalization/detection.ts\` — a utility that checks if the current user has prior Segment events indicating they should see personalized content on their second page view.

\`\`\`ts
import { analytics } from "@/components/providers/analytics-provider";

export function trackProductView(productId: string, category: string) {
  analytics.track("Product Viewed", {
    product_id: productId,
    category,
    timestamp: new Date().toISOString(),
  });
  // Store in sessionStorage for immediate access on next page
  sessionStorage.setItem("last_viewed_category", category);
}

export function getLastViewedCategory(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("last_viewed_category");
}
\`\`\`

The next page load checks \`getLastViewedCategory()\` and dynamically adjusts the hero banner.`);
  }

  const hasFeatures = blocks.length > 0;
  const body = hasFeatures
    ? blocks.join("\n\n---\n\n")
    : "No optional architecture features were selected. Proceed to the next step.";

  return {
    stepNumber: 0,
    title: "Demo Architecture Setup",
    expectedOutput: hasFeatures
      ? `Architecture features configured: ${[
          architecture.enableSESidebar && "SE Sidebar",
          architecture.enableSeededProfiles && "Seeded Profiles",
          architecture.enableProfileAPI && "Profile API",
          architecture.enableIntentPredictions && "Intent Predictions",
          architecture.enableSecondPagePers && "Second-Page Personalization",
        ]
          .filter(Boolean)
          .join(", ")}.`
      : "No optional architecture features selected — this step can be skipped.",
    promptText: `# Step: Demo Architecture — ${customerName} (${industry})

${body}
`,
  };
}
