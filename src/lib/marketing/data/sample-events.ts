export type SegmentCallType = "track" | "identify" | "page" | "group";

export interface SampleEvent {
  type: SegmentCallType;
  call: string;
  tooltip: string;
}

/** Color-coded by call type to match marketing palette */
export const callTypeColors: Record<SegmentCallType, string> = {
  track: "bg-marketing-blue",
  identify: "bg-marketing-purple",
  page: "bg-marketing-green",
  group: "bg-marketing-cyan",
};

export const callTypeDescriptions: Record<SegmentCallType, string> = {
  track: "Track calls record user actions and events",
  identify: "Identify calls tie actions to a known user",
  page: "Page calls record which pages users visit",
  group: "Group calls associate users with an account or org",
};

export const sampleEvents: SampleEvent[] = [
  {
    type: "track",
    call: 'track("Product Viewed", { category: "Electronics", price: 299 })',
    tooltip: "Fired when a user views a product detail page",
  },
  {
    type: "identify",
    call: 'identify("user_8f2k", { plan: "Enterprise", company: "Acme" })',
    tooltip: "Associates traits with a known user profile",
  },
  {
    type: "page",
    call: 'page("Pricing", { referrer: "/features" })',
    tooltip: "Records a pageview with contextual properties",
  },
  {
    type: "track",
    call: 'track("Cart Abandoned", { items: 3, value: 147.50 })',
    tooltip: "Triggered after 30s of inactivity with items in cart",
  },
  {
    type: "group",
    call: 'group("org_456", { industry: "FinTech", tier: "Growth" })',
    tooltip: "Links the user to their organization and its traits",
  },
  {
    type: "track",
    call: 'track("Demo Script Generated", { persona: "CMO" })',
    tooltip: "Fired when an AI demo script finishes generating",
  },
  {
    type: "identify",
    call: 'identify("user_r3x9", { role: "Solutions Engineer" })',
    tooltip: "Updates the user's role trait in their profile",
  },
  {
    type: "page",
    call: 'page("Dashboard", { total_playbooks: 12 })',
    tooltip: "Records dashboard view with playbook count context",
  },
  {
    type: "track",
    call: 'track("Playbook Created", { industry: "E-commerce" })',
    tooltip: "A new playbook was compiled and saved",
  },
  {
    type: "track",
    call: 'track("Prompt Copied", { step: 3, title: "Add Tracking" })',
    tooltip: "User copied a prompt to paste into Claude Code",
  },
  {
    type: "group",
    call: 'group("org_789", { plan: "Business", employees: 250 })',
    tooltip: "Associates account-level attributes for B2B targeting",
  },
  {
    type: "track",
    call: 'track("Wizard Step Submitted", { step: 2, persona: "CTO" })',
    tooltip: "Tracks progression through the builder wizard",
  },
  {
    type: "page",
    call: 'page("Playbook Viewer", { status: "completed" })',
    tooltip: "User opened a completed playbook for review",
  },
  {
    type: "identify",
    call: 'identify("user_k4m2", { email: "se@twilio.com" })',
    tooltip: "Identifies a Twilio SE with their email trait",
  },
  {
    type: "track",
    call: 'track("AI Chat Sent", { has_context: true })',
    tooltip: "User sent a message to the AI Segment Copilot",
  },
  {
    type: "track",
    call: 'track("Keys Injected", { field_count: 4 })',
    tooltip: "Credentials were rehydrated into a shared playbook",
  },
  {
    type: "page",
    call: 'page("Builder", { step: "scenarios" })',
    tooltip: "User navigated to the scenario selection step",
  },
  {
    type: "track",
    call: 'track("Compilation Completed", { total_ms: 3200 })',
    tooltip: "All 5 compilation phases finished successfully",
  },
  {
    type: "group",
    call: 'group("org_101", { industry: "Media", arr: "$2.4M" })',
    tooltip: "Enriches the account profile with revenue data",
  },
  {
    type: "track",
    call: 'track("Share Link Copied", { visibility: "public" })',
    tooltip: "Playbook share URL was copied to clipboard",
  },
];
