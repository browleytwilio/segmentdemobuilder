import { tool } from "ai";
import { z } from "zod";

const KNOWLEDGE_BASE: Record<string, string> = {
  "identity resolution": `Segment Unify performs identity resolution by merging user profiles across devices and channels. It uses deterministic matching (exact matches on email, phone, external IDs) and probabilistic matching (behavioral signals). The identity graph maintains a canonical profile with all associated identifiers. Key concepts: external_id, anonymous_id, merge rules, identity conflicts, the Profile API for real-time lookups.`,

  unify: `Segment Unify is the identity resolution and profile management layer. It creates a unified customer profile by merging data from all sources. Components: Identity Resolution (merge logic), Profile API (real-time trait lookups), Computed Traits (derived attributes), SQL Traits (warehouse-backed attributes), Audiences (segments of users). The Profile API endpoint is: https://profiles.segment.com/v1/spaces/{space_id}/collections/users/profiles/{identifier}/traits`,

  "profile api": `The Profile API provides real-time access to merged user profiles. Endpoint pattern: GET /v1/spaces/{space_id}/collections/users/profiles/{type}:{id}/traits. Auth: HTTP Basic with the Profile API token. Response includes all merged traits, computed traits, and audience memberships. Use cases: real-time personalization, in-app experiences, server-side decisioning. Rate limit: 100 req/s per space.`,

  protocols: `Protocols is Segment's data governance layer. Core feature: Tracking Plans — JSON schemas that define allowed events, their properties, and data types. When an event violates the plan, Protocols can: allow (pass through with violation flag), block (drop the event), or omit properties. Violations appear in the Protocols dashboard. Best practice: start in "allow" mode, review violations, then tighten to "block" for critical events.`,

  sources: `Sources are how data enters Segment. Types: JavaScript (analytics.js for websites), Mobile SDKs (iOS, Android, React Native), Server libraries (Node.js, Python, Java, Go, Ruby), Cloud Sources (Stripe, Salesforce — pull data into Segment). Each source has a Write Key for authentication. The analytics.js snippet loads asynchronously and queues calls before the library initializes.`,

  destinations: `Destinations are where Segment sends data. Types: Cloud-mode (server-to-server via Segment), Device-mode (loaded client-side). 400+ pre-built integrations. Key destinations: Google Analytics, Mixpanel, Amplitude, Braze, HubSpot, Salesforce, BigQuery, Snowflake, Redshift. Destination Filters allow selective event forwarding. Functions enable custom transformations.`,

  engage: `Engage (formerly Personas) is Segment's audience activation and journey orchestration tool. Audiences: define segments using traits and event conditions (e.g., "users who viewed product in last 7 days AND have lifetime_value > $100"). Journeys: multi-step, event-triggered flows (email → wait → check condition → SMS). Audiences sync to destinations in real-time.`,

  functions: `Segment Functions are custom JavaScript that runs in Segment's infrastructure. Source Functions: transform or generate events before they enter the pipeline. Destination Functions: transform events before they reach a destination. Insert Functions: sit between source and destination for middleware-like transforms. Runtime: Node.js, 60s timeout, 128MB memory. Use cases: PII masking, enrichment, custom routing.`,

  "computed traits": `Computed Traits are derived user attributes calculated automatically by Segment. Types: Event Counter (count of events), Aggregation (sum/avg/min/max of a property), Most Frequent (mode of a property value), First/Last (first or last value seen), Unique List (distinct values). Example: "products_viewed_count" = count of "Product Viewed" events in last 30 days. Updated in real-time as new events arrive.`,

  "data warehouse": `Segment Warehouses syncs event data to cloud data warehouses (BigQuery, Snowflake, Redshift, Postgres). Creates structured tables: one per event type (e.g., "product_viewed"), plus "identifies" and "users" tables. Sync frequency: configurable from 1 hour. Selective Sync allows choosing which sources/events to sync. Replay allows backfilling historical data.`,

  privacy: `Segment Privacy tools help with GDPR/CCPA compliance. User Deletion: API to delete all data for a given user across all destinations. Suppression: prevent future data collection for specific users. Consent Management: integrates with OneTrust, TrustArc — stamps events with consent status, destinations respect consent categories. Data Subject Access Requests (DSAR) supported.`,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const segmentKnowledgeTool = (tool as any)({
  description:
    "Look up detailed information about a Segment CDP concept. Use this when the user asks about Segment features, APIs, or architecture.",
  parameters: z.object({
    topic: z
      .string()
      .describe(
        "The Segment concept to look up (e.g., 'identity resolution', 'Profile API', 'Protocols')"
      ),
  }),
  execute: async ({ topic }: { topic: string }) => {
    const key = topic.toLowerCase().trim();

    // Direct match
    if (KNOWLEDGE_BASE[key]) {
      return { found: true, topic, content: KNOWLEDGE_BASE[key] };
    }

    // Partial match
    const match = Object.entries(KNOWLEDGE_BASE).find(
      ([k]) => key.includes(k) || k.includes(key)
    );
    if (match) {
      return { found: true, topic: match[0], content: match[1] };
    }

    return {
      found: false,
      topic,
      content: `No specific knowledge base entry for "${topic}". Answer based on your general Segment CDP knowledge.`,
    };
  },
});
