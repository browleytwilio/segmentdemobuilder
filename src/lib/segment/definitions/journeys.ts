/**
 * Journey specifications for Segment Engage.
 *
 * Journeys are built in the Engage UI — these definitions serve as
 * executable specifications documenting the exact flow, timing, and
 * messaging for each journey. Reference these when configuring in the UI.
 *
 * Delivery channel: Slack DM (all users are internal Twilio employees).
 */

export interface JourneyStep {
  type: "wait" | "check" | "message" | "exit";
  /** Duration for "wait" steps */
  duration?: string;
  /** Condition for "check" steps */
  condition?: string;
  /** Message content for "message" steps */
  message?: string;
  /** Branches for "check" steps */
  yes?: JourneyStep[];
  no?: JourneyStep[];
}

export interface JourneySpec {
  name: string;
  description: string;
  trigger: string;
  channel: "slack";
  steps: JourneyStep[];
}

// ---------------------------------------------------------------------------
// Journey 1: Onboarding — First Playbook
// ---------------------------------------------------------------------------

const onboardingJourney: JourneySpec = {
  name: "Onboarding — First Playbook",
  description:
    "Guide new users from signup to creating their first playbook. Three-touch sequence with graceful exit on activation.",
  trigger: 'Event: "Signed Up"',
  channel: "slack",
  steps: [
    { type: "wait", duration: "1 day" },
    {
      type: "check",
      condition: "has_created_playbook = true",
      yes: [{ type: "exit" }],
      no: [
        {
          type: "message",
          message:
            "Welcome to Segment Demo Builder! Create your first playbook and have a polished demo ready in minutes. Start here: {{app_url}}/builder",
        },
        { type: "wait", duration: "3 days" },
        {
          type: "check",
          condition: "has_created_playbook = true",
          yes: [{ type: "exit" }],
          no: [
            {
              type: "message",
              message:
                "SEs who build a playbook prep demos 3x faster. Try starting from a template — pick one that matches your next prospect's industry: {{app_url}}/builder",
            },
            { type: "wait", duration: "5 days" },
            {
              type: "check",
              condition: "has_created_playbook = true",
              yes: [{ type: "exit" }],
              no: [{ type: "exit" }],
            },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Journey 2: Completion Nudge — Draft to Done
// ---------------------------------------------------------------------------

const completionNudgeJourney: JourneySpec = {
  name: "Completion Nudge — Draft to Done",
  description:
    "Nudge users who created a playbook but never compiled it. Two touches focused on removing friction.",
  trigger: 'Audience entry: "Draft Stuck"',
  channel: "slack",
  steps: [
    { type: "wait", duration: "2 days" },
    {
      type: "message",
      message:
        "Your playbook is ready to compile — one click and you'll have step-by-step prompts plus a demo script. Open it here: {{app_url}}/dashboard",
    },
    { type: "wait", duration: "5 days" },
    {
      type: "check",
      condition: "has_completed_playbook = true",
      yes: [{ type: "exit" }],
      no: [
        {
          type: "message",
          message:
            "Need help building? The AI Copilot can answer Segment questions while you work. Open it from the chat icon in the builder: {{app_url}}/builder",
        },
        { type: "wait", duration: "7 days" },
        { type: "exit" },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Journey 3: Feature Discovery — AI Features
// ---------------------------------------------------------------------------

const aiDiscoveryJourney: JourneySpec = {
  name: "Feature Discovery — AI Features",
  description:
    "Introduce AI capabilities to activated users who haven't tried them yet. Two touches with different AI entry points.",
  trigger: 'Audience entry: "AI Non-Adopters"',
  channel: "slack",
  steps: [
    { type: "wait", duration: "3 days" },
    {
      type: "message",
      message:
        "Did you know? The AI Copilot can answer Segment CDP questions while you build — from identity resolution to tracking plan best practices. Try it from the chat icon in the builder.",
    },
    { type: "wait", duration: "7 days" },
    {
      type: "check",
      condition: "has_used_ai_chat = true OR has_used_ai_script = true",
      yes: [{ type: "exit" }],
      no: [
        {
          type: "message",
          message:
            "Try \"Describe with AI\" — type what your demo needs in plain English and the builder will configure everything for you: {{app_url}}/builder (select the AI tab)",
        },
        { type: "wait", duration: "7 days" },
        { type: "exit" },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Journey 4: Collaboration Nudge — Share Your Work
// ---------------------------------------------------------------------------

const collaborationJourney: JourneySpec = {
  name: "Collaboration Nudge — Share Your Work",
  description:
    "Encourage sharing and community building among solo builders. Two touches highlighting team value.",
  trigger: 'Audience entry: "Sharing Non-Adopters"',
  channel: "slack",
  steps: [
    { type: "wait", duration: "3 days" },
    {
      type: "message",
      message:
        "Share your playbook with the SE team — they can clone and adapt it for their own prospects. Set visibility to \"Shared\" from any playbook page.",
    },
    { type: "wait", duration: "7 days" },
    {
      type: "check",
      condition: "has_shared_playbook = true",
      yes: [{ type: "exit" }],
      no: [
        {
          type: "message",
          message:
            "Check out what other SEs have shared — browse shared playbooks for inspiration and fork the ones you like: {{app_url}}/dashboard?tab=shared",
        },
        { type: "wait", duration: "7 days" },
        { type: "exit" },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Journey 5: Re-engagement — Come Back
// ---------------------------------------------------------------------------

const reengagementJourney: JourneySpec = {
  name: "Re-engagement — Come Back",
  description:
    "Win back dormant users with a single low-pressure touch. Respects the user by not over-messaging.",
  trigger: 'Audience entry: "Dormant Users"',
  channel: "slack",
  steps: [
    { type: "wait", duration: "3 days" },
    {
      type: "message",
      message:
        "Your Segment playbooks are waiting. We've added new templates and AI features since your last visit — check them out: {{app_url}}/dashboard",
    },
    { type: "wait", duration: "14 days" },
    {
      type: "check",
      condition: "last_active_at within 14 days",
      yes: [{ type: "exit" }],
      no: [{ type: "exit" }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Export all
// ---------------------------------------------------------------------------

export const ALL_JOURNEYS: JourneySpec[] = [
  onboardingJourney,
  completionNudgeJourney,
  aiDiscoveryJourney,
  collaborationJourney,
  reengagementJourney,
];
