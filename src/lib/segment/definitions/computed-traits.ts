import type { ComputedTraitDefinition } from "../api";

/**
 * 27 computed traits organized by purpose.
 * These enrich every user profile with aggregated usage metrics.
 */

// ---------------------------------------------------------------------------
// Helpers — DRY builders for the three main patterns
// ---------------------------------------------------------------------------

function eventCount(
  name: string,
  description: string,
  eventName: string
): ComputedTraitDefinition {
  return {
    name,
    description,
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "EVENT_PROPERTY",
        event: { name: eventName },
        aggregation: "count",
      },
    },
  };
}

function multiEventCount(
  name: string,
  description: string,
  eventNames: string[]
): ComputedTraitDefinition {
  return {
    name,
    description,
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "OR",
        children: eventNames.map((e) => ({
          type: "EVENT_PROPERTY",
          event: { name: e },
          aggregation: "count",
        })),
      },
    },
  };
}

function eventOccurred(
  name: string,
  description: string,
  eventName: string
): ComputedTraitDefinition {
  return {
    name,
    description,
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "EVENT",
        operator: "at_least_once",
        event: { name: eventName },
      },
    },
  };
}

function multiEventOccurred(
  name: string,
  description: string,
  eventNames: string[]
): ComputedTraitDefinition {
  return {
    name,
    description,
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "OR",
        children: eventNames.map((e) => ({
          type: "EVENT",
          operator: "at_least_once",
          event: { name: e },
        })),
      },
    },
  };
}

function lastEventTimestamp(
  name: string,
  description: string,
  eventName: string
): ComputedTraitDefinition {
  return {
    name,
    description,
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "EVENT_PROPERTY",
        event: { name: eventName },
        aggregation: "last_timestamp",
      },
    },
  };
}

function firstEventTimestamp(
  name: string,
  description: string,
  eventName: string
): ComputedTraitDefinition {
  return {
    name,
    description,
    enabled: true,
    definition: {
      type: "USERS",
      query: {
        type: "EVENT_PROPERTY",
        event: { name: eventName },
        aggregation: "first_timestamp",
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Volume Metrics (10)
// ---------------------------------------------------------------------------

const volumeMetrics: ComputedTraitDefinition[] = [
  eventCount(
    "total_playbooks_created",
    "Lifetime count of playbooks created by this user",
    "Playbook Created"
  ),
  eventCount(
    "total_compilations",
    "Lifetime count of successful playbook compilations",
    "Compilation Completed"
  ),
  eventCount(
    "total_compilations_failed",
    "Lifetime count of failed playbook compilations",
    "Compilation Failed"
  ),
  eventCount(
    "total_prompts_copied",
    "Lifetime count of prompts copied to clipboard",
    "Prompt Copied"
  ),
  multiEventCount(
    "total_exports",
    "Total exports (prompts + demo scripts)",
    ["Prompts Exported", "Demo Script Exported"]
  ),
  multiEventCount(
    "total_shares",
    "Total sharing actions (link copies + visibility changes)",
    ["Share Link Copied", "Playbook Visibility Changed"]
  ),
  eventCount(
    "total_comments_added",
    "Lifetime count of comments posted on playbooks",
    "Comment Added"
  ),
  multiEventCount(
    "total_clones",
    "Total playbook clones and forks",
    ["Playbook Cloned", "Shared Playbook Forked"]
  ),
  eventCount(
    "total_steps_completed",
    "Total prompt steps marked as complete",
    "Step Marked Complete"
  ),
  multiEventCount(
    "total_ai_interactions",
    "Total AI feature interactions (chat, script gen, NL builder, enrichment)",
    ["AI Chat Sent", "AI Script Generated", "NL Builder Used", "AI Enrichment Completed"]
  ),
];

// ---------------------------------------------------------------------------
// Boolean Feature Adoption Flags (14)
// ---------------------------------------------------------------------------

const adoptionFlags: ComputedTraitDefinition[] = [
  eventOccurred(
    "has_created_playbook",
    "Whether this user has ever created a playbook",
    "Playbook Created"
  ),
  eventOccurred(
    "has_completed_playbook",
    "Whether this user has ever completed a compilation",
    "Compilation Completed"
  ),
  eventOccurred(
    "has_used_ai_chat",
    "Whether this user has ever used the AI Copilot chat",
    "AI Chat Sent"
  ),
  eventOccurred(
    "has_used_ai_script",
    "Whether this user has ever generated an AI demo script",
    "AI Script Generated"
  ),
  eventOccurred(
    "has_used_ai_enrichment",
    "Whether this user has ever triggered AI prompt enrichment",
    "AI Enrichment Completed"
  ),
  eventOccurred(
    "has_used_nl_builder",
    "Whether this user has ever used the natural language builder",
    "NL Builder Used"
  ),
  eventOccurred(
    "has_used_templates",
    "Whether this user has ever created a playbook from a template",
    "Template Used"
  ),
  eventOccurred(
    "has_shared_playbook",
    "Whether this user has ever changed playbook visibility",
    "Playbook Visibility Changed"
  ),
  eventOccurred(
    "has_added_comments",
    "Whether this user has ever commented on a playbook",
    "Comment Added"
  ),
  eventOccurred(
    "has_cloned_playbook",
    "Whether this user has ever cloned or forked a playbook",
    "Playbook Cloned"
  ),
  multiEventOccurred(
    "has_used_tags",
    "Whether this user has ever created or applied tags",
    ["Tag Created", "Tag Applied"]
  ),
  eventOccurred(
    "has_used_search",
    "Whether this user has ever used dashboard search",
    "Dashboard Searched"
  ),
  eventOccurred(
    "has_used_favorites",
    "Whether this user has ever favorited a playbook",
    "Playbook Favorited"
  ),
  eventOccurred(
    "has_viewed_shared_playbooks",
    "Whether this user has ever viewed the shared playbooks tab",
    "Shared Playbooks Viewed"
  ),
];

// ---------------------------------------------------------------------------
// Recency Timestamps (3)
// ---------------------------------------------------------------------------

const recencyTimestamps: ComputedTraitDefinition[] = [
  lastEventTimestamp(
    "last_active_at",
    "Timestamp of the user's most recent tracked event",
    "Dashboard Viewed"
  ),
  lastEventTimestamp(
    "last_playbook_created_at",
    "Timestamp of user's most recent playbook creation",
    "Playbook Created"
  ),
  firstEventTimestamp(
    "first_playbook_created_at",
    "Timestamp of user's first ever playbook creation",
    "Playbook Created"
  ),
];

// ---------------------------------------------------------------------------
// Export all
// ---------------------------------------------------------------------------

export const ALL_COMPUTED_TRAITS: ComputedTraitDefinition[] = [
  ...volumeMetrics,
  ...adoptionFlags,
  ...recencyTimestamps,
];
