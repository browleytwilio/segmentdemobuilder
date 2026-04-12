import { z } from "zod";

// ─── Constants for Select/Checkbox UI ───────────────────────────────

export const PERSONA_OPTIONS = [
  "CMO",
  "CTO / Engineering",
  "Product Manager",
  "Data Team",
] as const;

export const INDUSTRY_OPTIONS = [
  "E-commerce / Retail",
  "B2B SaaS",
  "FinTech",
  "Media & Entertainment",
] as const;

export type Industry = (typeof INDUSTRY_OPTIONS)[number];

/** @deprecated Scenarios now fetched from `demo_features` table. Kept for Zod schema reference. */
export const SCENARIO_OPTIONS: Record<
  Industry,
  { value: string; label: string; description: string }[]
> = {
  "E-commerce / Retail": [
    {
      value: "second-page-personalization",
      label: "Second-Page Personalization",
      description:
        "Swap hero banner based on prior Product Viewed event",
    },
    {
      value: "authenticated-vip-state",
      label: "Authenticated VIP State",
      description:
        "Instantly remove shipping costs via identify trait",
    },
    {
      value: "cart-abandonment-recovery",
      label: "Cart Abandonment Recovery",
      description:
        "Simulate a push notification based on stale cart state",
    },
  ],
  "B2B SaaS": [
    {
      value: "intent-prediction-upsell",
      label: "Intent Prediction Up-sell",
      description:
        "Inject 'Talk to Sales' modal based on high usage traits",
    },
    {
      value: "group-level-context",
      label: "Group Level Context",
      description:
        "Render Admin tabs only if group() call registers an Enterprise tier",
    },
  ],
  FinTech: [
    {
      value: "edge-pii-masking",
      label: "Edge-based PII Masking",
      description:
        "Demonstrate client-side payload scrubbing before data reaches Segment",
    },
    {
      value: "risk-profile-gating",
      label: "Risk Profile Gating",
      description:
        "Restrict loan UI components based on real-time credit trait updates",
    },
  ],
  "Media & Entertainment": [
    {
      value: "content-affinity-engine",
      label: "Content Affinity Engine",
      description:
        "Dynamically reorder homepage categories based on computed content affinity scores",
    },
    {
      value: "paywall-thresholds",
      label: "Paywall Thresholds",
      description:
        "Trigger a subscription block after exactly 3 anonymous article views",
    },
  ],
};

// ─── Step 1: Base Context & Persona ─────────────────────────────────

export const contextSchema = z.object({
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters"),
  persona: z.enum(PERSONA_OPTIONS),
  industry: z.enum(INDUSTRY_OPTIONS),
});

export type ContextFormData = z.infer<typeof contextSchema>;

// ─── Step 2: Core Demo Architecture ─────────────────────────────────

export const architectureSchema = z.object({
  enableSESidebar: z.boolean(),
  enableSeededProfiles: z.boolean(),
  enableProfileAPI: z.boolean(),
  enableIntentPredictions: z.boolean(),
  databaseProvider: z.enum(["supabase", "neon", "generic-postgres"]),
  authProvider: z.enum(["none", "clerk", "nextauth", "supabase-auth"]),
});

export type ArchitectureFormData = z.infer<typeof architectureSchema>;

// ─── Step 3: Actionable Personalization Scenarios ───────────────────

export const scenariosSchema = z.object({
  selectedScenarios: z.array(z.string()),
});

export type ScenariosFormData = z.infer<typeof scenariosSchema>;

// ─── Step 4: Credential Ingestion & Validation ──────────────────────
// Extracted to dedicated shared file for reuse by Rehydration Modal (PRD 9)
export {
  baseCredentialsSchema,
  createCredentialsSchema,
  type CredentialsFormData,
} from "./credentialsSchema";
