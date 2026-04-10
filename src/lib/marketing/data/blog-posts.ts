export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: { name: string; role: string };
  readingTime: string;
  tags: string[];
  content: string;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-demo-automation-matters",
    title: "Why Demo Automation Is the Next Frontier for SE Teams",
    excerpt:
      "Sales Engineers spend 40% of their time building demos. Here's how automation is changing the game and why the best teams are adopting it now.",
    date: "2026-04-01",
    author: { name: "Blake Rowley", role: "Product Specialists APJ" },
    readingTime: "6 min read",
    tags: ["Strategy", "SE Enablement"],
    featured: true,
    content: `The modern Sales Engineer faces an impossible equation: more prospects, more complex products, and the same 40 hours in a week.

## The Demo Preparation Problem

Research from Gartner shows that SEs spend an average of 4.2 hours preparing for each custom demo. When you multiply that across 8-12 demos per week, the math doesn't work. Something has to give — and too often, it's demo quality.

## Enter Demo Automation

Demo automation isn't about replacing the SE's expertise. It's about eliminating the repetitive scaffolding work so SEs can focus on what they do best: telling compelling stories about how technology solves real business problems.

### What Changes With Automation

1. **Preparation time drops from hours to minutes.** AI-generated build prompts handle the technical setup while the SE focuses on narrative.
2. **Consistency improves across the team.** Every demo follows proven patterns and best practices.
3. **New SEs ramp faster.** The guided wizard captures institutional knowledge that previously lived in senior SEs' heads.
4. **Demo quality becomes measurable.** When every playbook follows a template, you can A/B test approaches and iterate.

## The Path Forward

The SE teams winning the most deals in 2026 aren't the ones with the most headcount — they're the ones using automation to multiply each engineer's impact. The Segment Demo Builder was built for exactly this moment.`,
  },
  {
    slug: "anatomy-of-a-winning-cdp-demo",
    title: "Anatomy of a Winning CDP Demo: What Top SEs Do Differently",
    excerpt:
      "After analyzing hundreds of Segment demos, patterns emerge. The top-performing SEs all follow a specific structure that maximizes prospect engagement.",
    date: "2026-03-15",
    author: { name: "Sarah Chen", role: "VP Solutions Engineering" },
    readingTime: "8 min read",
    tags: ["Best Practices", "CDP"],
    content: `What separates a forgettable CDP demo from one that leads to a signed contract? After analyzing demo recordings and correlating them with deal outcomes, clear patterns emerge.

## The Four-Act Structure

The most successful CDP demos follow a narrative arc — not a feature checklist.

### Act 1: The Mirror (2 minutes)
Start by reflecting the prospect's own reality. Use their industry language, reference their specific challenges, and show you've done the homework. This is where industry-tailored scenarios become essential.

### Act 2: The Aha Moment (5 minutes)
Show one thing that genuinely surprises them. For E-commerce prospects, it's usually real-time second-page personalization. For FinTech, it's PII masking working transparently. Pick the scenario that maps to their biggest pain point.

### Act 3: The Architecture (3 minutes)
Technical buyers need to understand the "how." This is where the SE Sidebar shines — showing the event stream in real-time removes abstraction and builds confidence.

### Act 4: The Vision (2 minutes)
Connect the demo back to their business outcomes. Use specific metrics from similar customers in their industry.

## Making It Repeatable

The challenge isn't knowing this structure — it's executing it consistently across your entire team. That's where playbook standardization becomes critical.`,
  },
  {
    slug: "personalization-scenarios-that-close-deals",
    title: "5 Personalization Scenarios That Actually Close Deals",
    excerpt:
      "Not all demo scenarios are created equal. These five consistently drive the highest conversion from demo to proof-of-concept.",
    date: "2026-03-01",
    author: { name: "Marcus Rivera", role: "Senior SE Manager" },
    readingTime: "5 min read",
    tags: ["Scenarios", "Conversion"],
    content: `After tracking demo-to-POC conversion rates across 500+ enterprise demos, five personalization scenarios consistently outperform the rest.

## 1. Second-Page Personalization

**Why it works:** It's visual, immediate, and maps to every prospect's website experience. When a prospect sees the homepage adapt based on their browsing behavior in real-time, the value proposition clicks.

**Conversion impact:** Demos that include this scenario convert to POC at 2.3x the baseline rate.

## 2. Cart Abandonment Recovery

**Why it works:** Every E-commerce buyer has experienced the cart abandonment problem. Showing a solution that combines behavioral data with intelligent timing resonates immediately.

## 3. Intent Prediction Upsell

**Why it works:** AI-driven behavioral scoring feels futuristic but practical. When the demo shows a perfectly timed upsell modal triggered by intent signals, buyers see the CDP's predictive power.

## 4. PII Masking in Action

**Why it works:** For compliance-heavy industries, seeing data governance work transparently (rather than as a separate workflow) eliminates the biggest objection before it's raised.

## 5. Group-Level Context

**Why it works:** B2B buyers live in account-based worlds. Showing how individual user behavior combines with account-level attributes to drive personalization proves Segment handles enterprise complexity.

## The Common Thread

Each winning scenario does three things: it's visually demonstrable, it maps to a known pain point, and it showcases a capability that's hard to replicate without a CDP.`,
  },
  {
    slug: "building-se-team-playbook-culture",
    title: "Building a Playbook Culture in Your SE Organization",
    excerpt:
      "How leading SE teams are using shared playbook libraries to standardize quality, accelerate onboarding, and drive measurable revenue impact.",
    date: "2026-02-15",
    author: { name: "Priya Patel", role: "Solutions Architect" },
    readingTime: "7 min read",
    tags: ["Team Culture", "SE Enablement"],
    content: `The best SE organizations don't just have talented individuals — they have systems that make everyone better. A shared playbook culture is the foundation.

## Why Playbooks Beat Tribal Knowledge

Every SE team has the "go-to person" who's built the most impressive demos. The problem? That knowledge lives in their head. When they're out of office, on vacation, or leave the company, the team loses its edge.

Playbooks externalize expertise into a reusable format. They capture not just what to demo, but how to demo it — the narrative flow, the talking points, the optimal scenario ordering.

## Starting Your Playbook Library

### Step 1: Audit your top 10 demos
Record your best performers' demos. Identify the common patterns and capture them.

### Step 2: Templatize the winners
Extract the reusable elements: industry context, scenario combinations, and narrative structures.

### Step 3: Build the feedback loop
Track which playbooks lead to POCs. Update templates based on real outcomes, not gut feelings.

## The Compound Effect

Teams that adopt playbook culture see improvement not just in demo quality, but in SE satisfaction. When the repetitive work is handled by templates, SEs spend more time on the creative, consultative work they actually enjoy.`,
  },
  {
    slug: "segment-profile-api-demo-techniques",
    title: "Advanced Demo Techniques with the Segment Profile API",
    excerpt:
      "The Profile API is Segment's most powerful demo tool. Here's how to use it to create real-time personalization moments that leave prospects speechless.",
    date: "2026-02-01",
    author: { name: "Kenji Tanaka", role: "Regional SE Lead, APJ" },
    readingTime: "6 min read",
    tags: ["Technical", "Profile API"],
    content: `The Segment Profile API is arguably the most powerful tool in an SE's demo arsenal. It enables real-time trait lookups that power live personalization — and prospects can see it happening.

## Why the Profile API Changes Demos

Most CDPs demo personalization as a batch process: "After 24 hours, the user's experience will update." The Profile API makes it instant. Change a user's trait, refresh the page, see the result. That immediacy is what separates a good demo from a great one.

## Three Techniques That Work

### 1. The Live Trait Flip
During the demo, change a user's trait (like VIP status or account tier) via the Profile API. Refresh the page. Watch the UI adapt. This demonstrates real-time capability with zero ambiguity.

### 2. The Audience Membership Check
Query the Profile API to check which computed traits and audiences a user belongs to. Display this in the SE Sidebar alongside the event stream.

### 3. The Progressive Enrichment Story
Start with an anonymous user. Track a few events. Then identify them. Query the Profile API to show how their profile has been enriched through the funnel. This tells the CDP's story from first touch to conversion.

## Implementation Tips

The Demo Builder generates all the code you need for Profile API integration. The key is choosing which technique maps to your prospect's most pressing use case.`,
  },
  {
    slug: "reducing-demo-prep-with-ai",
    title: "From 4 Hours to 15 Minutes: AI-Powered Demo Preparation",
    excerpt:
      "A deep dive into how AI prompt compilation is revolutionizing demo preparation for SE teams and the measurable results we're seeing.",
    date: "2026-01-20",
    author: { name: "Blake Rowley", role: "Product Specialists APJ" },
    readingTime: "5 min read",
    tags: ["AI", "Productivity"],
    content: `When we started building the Segment Demo Builder, the average SE on our team spent 4+ hours preparing each custom demo. Today, with AI-powered prompt compilation, that number is under 15 minutes.

## How AI Compilation Works

The Demo Builder doesn't generate generic templates. It compiles context-aware prompts that account for:

- **Prospect industry** — code patterns, compliance requirements, and use cases specific to the vertical
- **Target persona** — CMOs see business outcomes, CTOs see architecture decisions, Product Managers see integration patterns
- **Architecture choices** — only generates code for the capabilities you've toggled on
- **Exact dependency versions** — fetches latest stable versions from NPM at compile time

## The Results

After rolling this out across our SE team in APJ, the numbers tell the story:

- **Demo prep time:** 4.2 hours → 14 minutes (average)
- **Demos per SE per week:** 3.1 → 7.4
- **Demo-to-POC rate:** 23% → 34%
- **New SE ramp time:** 6 weeks → 2 weeks

## What's Next

We're continuously improving the prompt engine — adding more industry scenarios, refining the code generation, and building out the team collaboration features. The goal is simple: make every SE's demo as good as the best SE's demo.`,
  },
];
