import type { CreateAudiencePayload } from "../api";

/**
 * 18 audiences organized by activation purpose.
 * Each audience powers a specific campaign or journey.
 *
 * Query syntax: Segment CQL (Composable Query Language).
 * Key syntax rules (validated against live API):
 *   - Equality uses single `=`, not `==`
 *   - Boolean values aren't CQL literals — use event counts instead
 *   - Property filters: event("X").where(property("y") = "val").count()
 *   - Combine with AND / OR
 */

// ---------------------------------------------------------------------------
// Lifecycle Audiences (6)
// ---------------------------------------------------------------------------

const lifecycleAudiences: CreateAudiencePayload[] = [
  {
    name: "New Users - No Playbook",
    description:
      "Signed up but never created a playbook. Target: onboarding nudges.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query: 'event("Playbook Created").count() = 0',
    },
  },
  {
    name: "Draft Stuck",
    description:
      "Created a playbook but never compiled it. Target: compilation reminder.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Playbook Created").count() > 0 AND event("Compilation Completed").count() = 0',
    },
  },
  {
    name: "Active Builders",
    description:
      "Created at least 1 playbook and compiled. Healthy cohort baseline.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Playbook Created").count() >= 1 AND event("Compilation Completed").count() >= 1',
    },
  },
  {
    name: "Power Users",
    description:
      "3+ compilations. Target: feedback candidates, beta features.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query: 'event("Compilation Completed").count() >= 3',
    },
  },
  {
    name: "Dormant Users",
    description:
      "Has created a playbook but no recent dashboard activity. Target: re-engagement.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Playbook Created").count() > 0 AND event("Dashboard Viewed").count() >= 1',
    },
  },
  {
    name: "Churned Users",
    description:
      "Has playbooks and compilations but extended inactivity. Target: win-back campaign.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Playbook Created").count() >= 1 AND event("Compilation Completed").count() >= 1',
    },
  },
];

// ---------------------------------------------------------------------------
// Feature Adoption Audiences (7)
// ---------------------------------------------------------------------------

const featureAdoptionAudiences: CreateAudiencePayload[] = [
  {
    name: "AI Non-Adopters",
    description:
      "Activated users who have never used any AI feature. Target: AI feature discovery.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Compilation Completed").count() > 0 AND event("AI Chat Sent").count() = 0 AND event("AI Script Generated").count() = 0 AND event("AI Enrichment Completed").count() = 0 AND event("NL Builder Used").count() = 0',
    },
  },
  {
    name: "AI Power Users",
    description: "Heavy AI feature users. Target: beta feature invites.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("AI Chat Sent").count() >= 3 OR event("AI Script Generated").count() >= 3 OR event("NL Builder Used").count() >= 3 OR event("AI Enrichment Completed").count() >= 3',
    },
  },
  {
    name: "Template Non-Adopters",
    description:
      "Completed playbooks but never used templates. Target: template awareness.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Compilation Completed").count() > 0 AND event("Template Used").count() = 0',
    },
  },
  {
    name: "Sharing Non-Adopters",
    description:
      "Has compiled playbooks but never shared. Target: collaboration nudge.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Compilation Completed").count() >= 1 AND event("Playbook Visibility Changed").count() = 0',
    },
  },
  {
    name: "Solo Builders",
    description:
      "Completed playbooks but never interacted with shared content or comments. Target: community activation.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Compilation Completed").count() > 0 AND event("Comment Added").count() = 0 AND event("Shared Playbooks Viewed").count() = 0',
    },
  },
  {
    name: "Organization Non-Adopters",
    description:
      "3+ playbooks but never used tags or favorites. Target: organization tips.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Playbook Created").count() >= 3 AND event("Tag Created").count() = 0 AND event("Tag Applied").count() = 0 AND event("Playbook Favorited").count() = 0',
    },
  },
  {
    name: "Export Champions",
    description: "Frequent exporters. Target: content distribution, advocacy.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Prompts Exported").count() >= 2 OR event("Demo Script Exported").count() >= 2',
    },
  },
];

// ---------------------------------------------------------------------------
// Industry Cohorts (4)
// ---------------------------------------------------------------------------

const industryCohorts: CreateAudiencePayload[] = [
  {
    name: "FinTech Builders",
    description: "Users who have built FinTech industry playbooks.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Wizard Step Submitted").where(property("industry") = "FinTech").count() > 0',
    },
  },
  {
    name: "E-commerce Builders",
    description: "Users who have built E-commerce/Retail industry playbooks.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Wizard Step Submitted").where(property("industry") = "E-commerce/Retail").count() > 0',
    },
  },
  {
    name: "B2B SaaS Builders",
    description: "Users who have built B2B SaaS industry playbooks.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Wizard Step Submitted").where(property("industry") = "B2B SaaS").count() > 0',
    },
  },
  {
    name: "Media Builders",
    description:
      "Users who have built Media & Entertainment industry playbooks.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query:
        'event("Wizard Step Submitted").where(property("industry") = "Media & Entertainment").count() > 0',
    },
  },
];

// ---------------------------------------------------------------------------
// Admin Audience (1)
// ---------------------------------------------------------------------------

const adminAudience: CreateAudiencePayload[] = [
  {
    name: "Super Admins",
    description:
      "Users with super_admin role. Used for admin-specific communications.",
    enabled: true,
    audienceType: "USERS",
    definition: {
      query: 'trait("role") = "super_admin"',
    },
  },
];

// ---------------------------------------------------------------------------
// Export all
// ---------------------------------------------------------------------------

export const ALL_AUDIENCES: CreateAudiencePayload[] = [
  ...lifecycleAudiences,
  ...featureAdoptionAudiences,
  ...industryCohorts,
  ...adminAudience,
];
