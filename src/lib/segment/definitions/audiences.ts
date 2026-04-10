import type { AudienceDefinition } from "../api";

/**
 * 18 audiences organized by activation purpose.
 * Each audience powers a specific campaign or journey.
 */

// ---------------------------------------------------------------------------
// Lifecycle Audiences (6)
// ---------------------------------------------------------------------------

const lifecycleAudiences: AudienceDefinition[] = [
  {
    name: "New Users - No Playbook",
    description: "Signed up in last 30 days but never created a playbook. Target: onboarding nudges.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          {
            type: "TRAIT",
            trait: "has_created_playbook",
            operator: "equals",
            value: false,
          },
          {
            type: "EVENT",
            event: { name: "Signed In" },
            operator: "at_least_once",
            window: { value: 30, unit: "days" },
          },
        ],
      },
    },
  },
  {
    name: "Draft Stuck",
    description: "Created a playbook but never compiled it. Target: compilation reminder.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          {
            type: "TRAIT",
            trait: "has_created_playbook",
            operator: "equals",
            value: true,
          },
          {
            type: "TRAIT",
            trait: "has_completed_playbook",
            operator: "equals",
            value: false,
          },
        ],
      },
    },
  },
  {
    name: "Active Builders",
    description: "Created at least 1 playbook and active in last 14 days. Healthy cohort baseline.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          {
            type: "TRAIT",
            trait: "total_playbooks_created",
            operator: "greater_than_or_equal",
            value: 1,
          },
          {
            type: "EVENT",
            event: { name: "Dashboard Viewed" },
            operator: "at_least_once",
            window: { value: 14, unit: "days" },
          },
        ],
      },
    },
  },
  {
    name: "Power Users",
    description: "3+ compilations and active in last 14 days. Target: feedback candidates, beta features.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          {
            type: "TRAIT",
            trait: "total_compilations",
            operator: "greater_than_or_equal",
            value: 3,
          },
          {
            type: "EVENT",
            event: { name: "Dashboard Viewed" },
            operator: "at_least_once",
            window: { value: 14, unit: "days" },
          },
        ],
      },
    },
  },
  {
    name: "Dormant Users",
    description: "Has created a playbook but no dashboard activity in 30+ days. Target: re-engagement.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          {
            type: "TRAIT",
            trait: "has_created_playbook",
            operator: "equals",
            value: true,
          },
          {
            type: "EVENT",
            event: { name: "Dashboard Viewed" },
            operator: "zero_times",
            window: { value: 30, unit: "days" },
          },
        ],
      },
    },
  },
  {
    name: "Churned Users",
    description: "Has playbooks but no activity in 60+ days. Target: win-back campaign.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          {
            type: "TRAIT",
            trait: "total_playbooks_created",
            operator: "greater_than_or_equal",
            value: 1,
          },
          {
            type: "EVENT",
            event: { name: "Dashboard Viewed" },
            operator: "zero_times",
            window: { value: 60, unit: "days" },
          },
        ],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Feature Adoption Audiences (7)
// ---------------------------------------------------------------------------

const featureAdoptionAudiences: AudienceDefinition[] = [
  {
    name: "AI Non-Adopters",
    description: "Activated users who have never used any AI feature. Target: AI feature discovery.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          { type: "TRAIT", trait: "has_completed_playbook", operator: "equals", value: true },
          { type: "TRAIT", trait: "has_used_ai_chat", operator: "equals", value: false },
          { type: "TRAIT", trait: "has_used_ai_script", operator: "equals", value: false },
          { type: "TRAIT", trait: "has_used_ai_enrichment", operator: "equals", value: false },
          { type: "TRAIT", trait: "has_used_nl_builder", operator: "equals", value: false },
        ],
      },
    },
  },
  {
    name: "AI Power Users",
    description: "5+ total AI interactions. Target: beta feature invites, feedback.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          {
            type: "TRAIT",
            trait: "total_ai_interactions",
            operator: "greater_than_or_equal",
            value: 5,
          },
        ],
      },
    },
  },
  {
    name: "Template Non-Adopters",
    description: "Completed playbooks but never used templates. Target: template awareness.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          { type: "TRAIT", trait: "has_completed_playbook", operator: "equals", value: true },
          { type: "TRAIT", trait: "has_used_templates", operator: "equals", value: false },
        ],
      },
    },
  },
  {
    name: "Sharing Non-Adopters",
    description: "Has compiled playbooks but never shared. Target: collaboration nudge.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          { type: "TRAIT", trait: "total_compilations", operator: "greater_than_or_equal", value: 1 },
          { type: "TRAIT", trait: "has_shared_playbook", operator: "equals", value: false },
        ],
      },
    },
  },
  {
    name: "Solo Builders",
    description: "Completed playbooks but never interacted with shared content or comments. Target: community activation.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          { type: "TRAIT", trait: "has_completed_playbook", operator: "equals", value: true },
          { type: "TRAIT", trait: "has_added_comments", operator: "equals", value: false },
          { type: "TRAIT", trait: "has_viewed_shared_playbooks", operator: "equals", value: false },
        ],
      },
    },
  },
  {
    name: "Organization Non-Adopters",
    description: "3+ playbooks but never used tags or favorites. Target: organization tips.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          { type: "TRAIT", trait: "total_playbooks_created", operator: "greater_than_or_equal", value: 3 },
          { type: "TRAIT", trait: "has_used_tags", operator: "equals", value: false },
          { type: "TRAIT", trait: "has_used_favorites", operator: "equals", value: false },
        ],
      },
    },
  },
  {
    name: "Export Champions",
    description: "3+ total exports. Target: content distribution, advocacy.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        operator: "and",
        children: [
          {
            type: "TRAIT",
            trait: "total_exports",
            operator: "greater_than_or_equal",
            value: 3,
          },
        ],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Industry Cohorts (4)
// ---------------------------------------------------------------------------

const industryCohorts: AudienceDefinition[] = [
  {
    name: "FinTech Builders",
    description: "Users who have built FinTech industry playbooks.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "EVENT",
        event: { name: "Wizard Step Submitted" },
        operator: "at_least_once",
        property: { name: "industry", operator: "equals", value: "FinTech" },
      },
    },
  },
  {
    name: "E-commerce Builders",
    description: "Users who have built E-commerce/Retail industry playbooks.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "EVENT",
        event: { name: "Wizard Step Submitted" },
        operator: "at_least_once",
        property: { name: "industry", operator: "equals", value: "E-commerce/Retail" },
      },
    },
  },
  {
    name: "B2B SaaS Builders",
    description: "Users who have built B2B SaaS industry playbooks.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "EVENT",
        event: { name: "Wizard Step Submitted" },
        operator: "at_least_once",
        property: { name: "industry", operator: "equals", value: "B2B SaaS" },
      },
    },
  },
  {
    name: "Media Builders",
    description: "Users who have built Media & Entertainment industry playbooks.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "EVENT",
        event: { name: "Wizard Step Submitted" },
        operator: "at_least_once",
        property: { name: "industry", operator: "equals", value: "Media & Entertainment" },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Admin Audience (1)
// ---------------------------------------------------------------------------

const adminAudience: AudienceDefinition[] = [
  {
    name: "Super Admins",
    description: "Users with super_admin role. Used for admin-specific communications.",
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "TRAIT",
        trait: "role",
        operator: "equals",
        value: "super_admin",
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Export all
// ---------------------------------------------------------------------------

export const ALL_AUDIENCES: AudienceDefinition[] = [
  ...lifecycleAudiences,
  ...featureAdoptionAudiences,
  ...industryCohorts,
  ...adminAudience,
];
