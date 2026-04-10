/**
 * 27 computed trait definitions for Segment Unify.
 *
 * The Segment Public API uses a string-based query language for definitions.
 * Note: Creating computed traits may require elevated token permissions
 * (Engage Admin). If the API returns 403, these definitions can be
 * created manually in the Segment UI (Unify > Computed Traits).
 */

export interface ComputedTraitDefinition {
  name: string;
  description: string;
  query: string;
}

// ---------------------------------------------------------------------------
// Volume Metrics (10)
// ---------------------------------------------------------------------------

const volumeMetrics: ComputedTraitDefinition[] = [
  {
    name: "total_playbooks_created",
    description: "Lifetime count of playbooks created by this user",
    query: 'event("Playbook Created").count()',
  },
  {
    name: "total_compilations",
    description: "Lifetime count of successful playbook compilations",
    query: 'event("Compilation Completed").count()',
  },
  {
    name: "total_compilations_failed",
    description: "Lifetime count of failed playbook compilations",
    query: 'event("Compilation Failed").count()',
  },
  {
    name: "total_prompts_copied",
    description: "Lifetime count of prompts copied to clipboard",
    query: 'event("Prompt Copied").count()',
  },
  {
    name: "total_exports",
    description: "Total exports (prompts + demo scripts)",
    query: 'event("Prompts Exported").count() + event("Demo Script Exported").count()',
  },
  {
    name: "total_shares",
    description: "Total sharing actions (link copies + visibility changes)",
    query: 'event("Share Link Copied").count() + event("Playbook Visibility Changed").count()',
  },
  {
    name: "total_comments_added",
    description: "Lifetime count of comments posted on playbooks",
    query: 'event("Comment Added").count()',
  },
  {
    name: "total_clones",
    description: "Total playbook clones and forks",
    query: 'event("Playbook Cloned").count() + event("Shared Playbook Forked").count()',
  },
  {
    name: "total_steps_completed",
    description: "Total prompt steps marked as complete",
    query: 'event("Step Marked Complete").count()',
  },
  {
    name: "total_ai_interactions",
    description: "Total AI feature interactions (chat, script gen, NL builder, enrichment)",
    query: 'event("AI Chat Sent").count() + event("AI Script Generated").count() + event("NL Builder Used").count() + event("AI Enrichment Completed").count()',
  },
];

// ---------------------------------------------------------------------------
// Boolean Feature Adoption Flags (14)
// ---------------------------------------------------------------------------

const adoptionFlags: ComputedTraitDefinition[] = [
  {
    name: "has_created_playbook",
    description: "Whether this user has ever created a playbook",
    query: 'event("Playbook Created").count() > 0',
  },
  {
    name: "has_completed_playbook",
    description: "Whether this user has ever completed a compilation",
    query: 'event("Compilation Completed").count() > 0',
  },
  {
    name: "has_used_ai_chat",
    description: "Whether this user has ever used the AI Copilot chat",
    query: 'event("AI Chat Sent").count() > 0',
  },
  {
    name: "has_used_ai_script",
    description: "Whether this user has ever generated an AI demo script",
    query: 'event("AI Script Generated").count() > 0',
  },
  {
    name: "has_used_ai_enrichment",
    description: "Whether this user has ever triggered AI prompt enrichment",
    query: 'event("AI Enrichment Completed").count() > 0',
  },
  {
    name: "has_used_nl_builder",
    description: "Whether this user has ever used the natural language builder",
    query: 'event("NL Builder Used").count() > 0',
  },
  {
    name: "has_used_templates",
    description: "Whether this user has ever created a playbook from a template",
    query: 'event("Template Used").count() > 0',
  },
  {
    name: "has_shared_playbook",
    description: "Whether this user has ever changed playbook visibility",
    query: 'event("Playbook Visibility Changed").count() > 0',
  },
  {
    name: "has_added_comments",
    description: "Whether this user has ever commented on a playbook",
    query: 'event("Comment Added").count() > 0',
  },
  {
    name: "has_cloned_playbook",
    description: "Whether this user has ever cloned or forked a playbook",
    query: 'event("Playbook Cloned").count() > 0',
  },
  {
    name: "has_used_tags",
    description: "Whether this user has ever created or applied tags",
    query: 'event("Tag Created").count() + event("Tag Applied").count() > 0',
  },
  {
    name: "has_used_search",
    description: "Whether this user has ever used dashboard search",
    query: 'event("Dashboard Searched").count() > 0',
  },
  {
    name: "has_used_favorites",
    description: "Whether this user has ever favorited a playbook",
    query: 'event("Playbook Favorited").count() > 0',
  },
  {
    name: "has_viewed_shared_playbooks",
    description: "Whether this user has ever viewed the shared playbooks tab",
    query: 'event("Shared Playbooks Viewed").count() > 0',
  },
];

// ---------------------------------------------------------------------------
// Recency Timestamps (3)
// ---------------------------------------------------------------------------

const recencyTimestamps: ComputedTraitDefinition[] = [
  {
    name: "last_active_at",
    description: "Timestamp of the user's most recent dashboard view",
    query: 'event("Dashboard Viewed").last_timestamp()',
  },
  {
    name: "last_playbook_created_at",
    description: "Timestamp of user's most recent playbook creation",
    query: 'event("Playbook Created").last_timestamp()',
  },
  {
    name: "first_playbook_created_at",
    description: "Timestamp of user's first ever playbook creation",
    query: 'event("Playbook Created").first_timestamp()',
  },
];

// ---------------------------------------------------------------------------
// Export all
// ---------------------------------------------------------------------------

export const ALL_COMPUTED_TRAITS: ComputedTraitDefinition[] = [
  ...volumeMetrics,
  ...adoptionFlags,
  ...recencyTimestamps,
];
