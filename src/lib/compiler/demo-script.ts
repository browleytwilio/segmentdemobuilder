import type { DemoArchitecture } from "@/lib/stores/builder-store";

export interface DemoScriptInput {
  customerName: string;
  persona: string;
  industry: string;
  selectedScenarios: string[];
  architecture: DemoArchitecture;
  scenarioSlugs?: Record<string, string>; // { [featureId]: slug } — new playbooks
}

interface ClickPathEntry {
  title: string;
  steps: string[];
  ahaMoment: string;
}

const CLICK_PATH_REGISTRY: Record<string, (input: DemoScriptInput) => ClickPathEntry> = {
  "second-page-personalization": (input) => ({
    title: "Second-Page Personalization",
    steps: [
      `Navigate to a product page in the ${input.customerName} demo.`,
      "Point out the **Product Viewed** event firing in the SE Sidebar.",
      "Click back to the homepage.",
      "Show how the **hero banner has changed** to reflect the category they just viewed.",
      `Explain: "This happened in real-time — Segment captured the Product Viewed event and the page instantly personalized."`,
    ],
    ahaMoment:
      "Open the Segment Debugger → show the `Product Viewed` event with its properties (product_id, category). Then refresh the homepage to prove the personalization persists via sessionStorage.",
  }),

  "authenticated-vip-state": (input) => ({
    title: "Authenticated VIP State",
    steps: [
      "Show the cart page with a standard shipping fee displayed.",
      "Click **Log In as VIP** (or trigger the identify call).",
      "Point out the instant UI change: shipping cost becomes **FREE (VIP)**.",
      `Explain: "The moment we identified this user as a VIP in Segment, the UI responded. No page reload needed."`,
    ],
    ahaMoment:
      "Open the Segment Debugger → show the `identify` call with `{ vip: true }` trait. Show the trait in the Unify Profile viewer.",
  }),

  "cart-abandonment-recovery": (input) => ({
    title: "Cart Abandonment Recovery",
    steps: [
      "Add items to the shopping cart.",
      "Navigate away from the cart (go to homepage or another page).",
      "Wait 30 seconds — a **push notification simulation** appears in the bottom-right.",
      `Explain: "Segment detected cart abandonment. In production, this would trigger a Twilio Engage push notification or email."`,
    ],
    ahaMoment:
      "Open the Segment Debugger → show the `Cart Abandoned` event with cart_value and product details. Show how this event could feed into a Twilio Engage audience.",
  }),

  "intent-prediction-upsell": (input) => ({
    title: "Intent Prediction Upsell",
    steps: [
      "Navigate the demo as a high-usage user (or inject high-intent traits).",
      'Point out the **"Talk to Sales" modal** that appears automatically.',
      `Explain: "Segment Predictions scored this user as high-intent (>70% likelihood to purchase). The modal triggers purely from trait data."`,
    ],
    ahaMoment:
      "Show the Profile API response with `likelihood_to_purchase > 0.7`. Explain how Segment Predictions computed this from behavioral data.",
  }),

  "group-level-context": (input) => ({
    title: "Group-Level Context",
    steps: [
      'Load the workspace as a **"Pro" tier** organization — note the standard navigation.',
      'Switch to an **"Enterprise" tier** organization (trigger the group call).',
      "Point out that **Admin tabs** (User Management, Audit Log, SSO Settings) now appear.",
      `Explain: "The group() call told Segment this org is Enterprise. The UI instantly adapts — no backend API call needed."`,
    ],
    ahaMoment:
      "Open the Segment Debugger → show the `group` call with `{ plan: 'Enterprise' }`. Show how this trait flows to the UI.",
  }),

  "edge-pii-masking": (input) => ({
    title: "Edge-based PII Masking",
    steps: [
      'Submit a form with sensitive data (e.g., SSN: "123-45-6789").',
      "Open the SE Sidebar and find the **Form Submitted** event.",
      'Point out that the SSN appears as **"*****6789"** — masked before it left the browser.',
      `Explain: "This middleware runs client-side, before data reaches Segment. PII never touches your data warehouse."`,
    ],
    ahaMoment:
      "Compare the raw form input with the masked payload in the Segment Debugger. Show the `track` call properties to prove the data was scrubbed.",
  }),

  "risk-profile-gating": (input) => ({
    title: "Risk Profile Gating",
    steps: [
      "Load the financial dashboard as a user with a **high credit score** — show the Pre-Approved loan panel.",
      "Switch to a user with a **low credit score** — show the restricted UI.",
      `Explain: "Segment's Profile API returns real-time credit traits. The UI gates financial products accordingly."`,
    ],
    ahaMoment:
      "Show the Profile API response with `credit_score` and `risk_level` traits. Explain how these traits could be computed by a Segment Function connected to a credit bureau.",
  }),

  "content-affinity-engine": (input) => ({
    title: "Content Affinity Engine",
    steps: [
      "Visit the homepage — note the default category ordering.",
      "Click into several **Technology** articles, spending time on each.",
      "Return to the homepage — note that **Technology now appears first**.",
      `Explain: "Segment tracked Content Viewed events. The affinity engine computed scores and reordered the homepage in real-time."`,
    ],
    ahaMoment:
      "Open the Segment Debugger → show multiple `Content Viewed` events with category and view_duration_seconds. Show how the affinity scores shifted.",
  }),

  "paywall-thresholds": (input) => ({
    title: "Paywall Thresholds",
    steps: [
      "Open an article — note the counter showing **2 free articles remaining**.",
      "Open a second article — counter shows **1 remaining**.",
      "Open a third article — the **paywall blocks the content** with a subscription prompt.",
      `Explain: "Segment tracked each Article Viewed event with a view count. On the 4th view, the paywall activates."`,
    ],
    ahaMoment:
      "Open the Segment Debugger → show the `Article Viewed` events with incrementing `view_number` properties. Show how this anonymous tracking works without any login.",
  }),
};

export function generateDemoScript(input: DemoScriptInput): string {
  const { customerName, persona, industry, selectedScenarios, architecture } =
    input;

  const sections: string[] = [];

  // Header
  sections.push(`# ${customerName} — SE Demo Script`);
  sections.push(`**Industry:** ${industry} | **Target Persona:** ${persona}`);
  sections.push("");

  // Setup Checklist
  sections.push("## Setup Checklist");
  sections.push("");
  sections.push("Before starting the demo, ensure:");
  sections.push("");
  sections.push("- [ ] Local dev server running (`npm run dev` → localhost:3000)");
  sections.push("- [ ] Segment workspace open in a separate browser tab");
  sections.push("- [ ] Segment Debugger / Live Event Stream visible");
  if (architecture.enableSESidebar) {
    sections.push("- [ ] SE Sidebar is visible (toggle in bottom-right corner)");
  }
  if (architecture.enableSeededProfiles) {
    sections.push("- [ ] Seeded profiles have been loaded (run the seed script)");
  }
  sections.push("- [ ] Browser DevTools open on Network tab (optional)");
  sections.push("");

  // Narrative
  sections.push("## The Narrative");
  sections.push("");
  sections.push(
    `> "Today we're going to show you how ${customerName} can leverage Segment's Customer Data Platform to create real-time, personalized experiences. I'm going to act as a ${persona} at ${customerName}, and we'll walk through exactly how customer data flows from your app into Segment and powers instant decisions."`
  );
  sections.push("");
  sections.push(
    `**Opening:** Start by briefly explaining that this is a fully working ${industry} application built with Segment's analytics-next SDK. Every event, trait, and group call you'll see is real — not a mockup.`
  );
  sections.push("");

  // Scenario Click Paths
  if (selectedScenarios.length > 0) {
    sections.push("## Demo Scenarios");
    sections.push("");

    for (const scenarioId of selectedScenarios) {
      // Resolve to slug: new playbooks have scenarioSlugs map, old playbooks use the value directly
      const slug = input.scenarioSlugs?.[scenarioId] ?? scenarioId;
      const factory = CLICK_PATH_REGISTRY[slug];
      if (!factory) continue;

      const entry = factory(input);
      sections.push(`### ${entry.title}`);
      sections.push("");
      for (let i = 0; i < entry.steps.length; i++) {
        sections.push(`${i + 1}. ${entry.steps[i]}`);
      }
      sections.push("");
      sections.push(`**"Aha!" Moment:** ${entry.ahaMoment}`);
      sections.push("");
      sections.push("---");
      sections.push("");
    }
  }

  // Closing
  sections.push("## Closing");
  sections.push("");
  sections.push(
    `> "Everything you just saw — the real-time personalization, the instant UI changes, the event stream — is powered by Segment. The data is flowing, the profiles are unified, and the experiences are being driven by real customer behavior. This is what ${customerName} can achieve with Segment CDP."`
  );
  sections.push("");
  sections.push(
    "**Next Steps:** Ask the prospect what scenarios resonated most and which they'd like to explore further. Offer to share the demo script and technical build prompts."
  );

  return sections.join("\n");
}
