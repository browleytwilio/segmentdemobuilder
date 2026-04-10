export interface UseCase {
  slug: string;
  industry: string;
  tagline: string;
  description: string;
  icon: string;
  challenges: string[];
  solutions: string[];
  scenarios: { name: string; description: string }[];
  metrics: { value: string; label: string }[];
}

export const useCases: UseCase[] = [
  {
    slug: "ecommerce",
    industry: "E-commerce & Retail",
    tagline: "Convert browsers into buyers with personalized experiences",
    description:
      "Demonstrate how Segment CDP powers real-time personalization across the entire shopping journey — from anonymous browsing to loyal customer.",
    icon: "ShoppingCart",
    challenges: [
      "High cart abandonment rates with no recovery strategy",
      "Generic homepage experience for all visitors",
      "No cross-channel identity resolution",
      "Unable to demonstrate real-time personalization in demos",
    ],
    solutions: [
      "Second-page personalization adapts content based on browsing behavior",
      "Cart abandonment recovery with intelligent push notifications",
      "VIP tier recognition surfaces exclusive offers for high-value customers",
      "Seeded user profiles showcase the full personalization journey",
    ],
    scenarios: [
      {
        name: "Second-Page Personalization",
        description: "Homepage dynamically adapts product recommendations based on the visitor's previous page views and category interest.",
      },
      {
        name: "Cart Abandonment Recovery",
        description: "Triggered notifications with personalized messaging recapture abandoned carts within the optimal engagement window.",
      },
      {
        name: "Authenticated VIP State",
        description: "Recognized high-value customers see exclusive pricing, free shipping badges, and priority support options on login.",
      },
      {
        name: "Intent Prediction Upsell",
        description: "AI-driven behavioral scoring surfaces cross-sell modals at the moment of highest purchase intent.",
      },
    ],
    metrics: [
      { value: "68%", label: "Faster demo preparation" },
      { value: "3.2x", label: "Higher prospect engagement" },
      { value: "41%", label: "Improvement in demo-to-POC rate" },
      { value: "< 5min", label: "Average playbook creation" },
    ],
  },
  {
    slug: "b2b-saas",
    industry: "B2B SaaS",
    tagline: "Show the power of data-driven product experiences",
    description:
      "Build compelling demos that showcase how Segment enables product-led growth through real-time user behavior tracking and account-level personalization.",
    icon: "Building2",
    challenges: [
      "Complex multi-stakeholder buying processes",
      "Need to demonstrate account-level personalization",
      "Difficulty showing real-time event streaming value",
      "Technical buyers expect live, working integrations",
    ],
    solutions: [
      "Group-level context adapts UI based on account attributes",
      "Profile API demonstrates real-time trait lookups",
      "SE Sidebar provides live event stream visualization",
      "Multi-architecture support shows Segment's flexibility",
    ],
    scenarios: [
      {
        name: "Group-Level Context",
        description: "Organization-based UI adaptations show enterprise features to qualifying accounts automatically.",
      },
      {
        name: "PII Masking",
        description: "Data governance controls demonstrate compliance readiness for privacy-conscious technical buyers.",
      },
      {
        name: "Profile API Integration",
        description: "Live trait lookups power real-time personalization decisions at the API level.",
      },
      {
        name: "Real-Time Event Stream",
        description: "SE Sidebar visualizes the event pipeline in real-time during the demo.",
      },
    ],
    metrics: [
      { value: "74%", label: "Reduction in demo prep time" },
      { value: "2.8x", label: "More demos per SE per quarter" },
      { value: "52%", label: "Higher technical win rate" },
      { value: "89%", label: "SE satisfaction score" },
    ],
  },
  {
    slug: "fintech",
    industry: "FinTech",
    tagline: "Demonstrate compliant, secure personalization at scale",
    description:
      "Create demos that address the unique challenges of financial services — data governance, compliance, and security-first personalization.",
    icon: "Landmark",
    challenges: [
      "Strict data governance and compliance requirements",
      "Need to demonstrate PII handling capabilities",
      "Security-conscious buyers demand credential safety proof",
      "Complex regulatory landscapes across regions",
    ],
    solutions: [
      "PII masking scenarios demonstrate data governance in action",
      "Credential security model with in-memory-only processing",
      "Compliance-ready architecture patterns in generated code",
      "Region-specific scenario customization",
    ],
    scenarios: [
      {
        name: "PII Masking & Governance",
        description: "Automated data classification and masking demonstrate Segment's privacy controls to compliance teams.",
      },
      {
        name: "Secure Credential Handling",
        description: "In-memory-only processing with automatic sanitization proves enterprise-grade security posture.",
      },
      {
        name: "Account Tier Personalization",
        description: "Product experiences adapt based on customer tier, portfolio value, and risk profile.",
      },
      {
        name: "Cross-Channel Identity",
        description: "Unified customer view across web, mobile, and branch interactions.",
      },
    ],
    metrics: [
      { value: "100%", label: "Credential security compliance" },
      { value: "56%", label: "Faster security review approval" },
      { value: "3.5x", label: "More compliance-ready demos" },
      { value: "< 10min", label: "FinTech playbook creation" },
    ],
  },
  {
    slug: "media",
    industry: "Media & Entertainment",
    tagline: "Engage audiences with data-driven content experiences",
    description:
      "Showcase how Segment CDP drives content personalization, subscriber engagement, and audience monetization across digital platforms.",
    icon: "Play",
    challenges: [
      "Content discovery is a major churn driver",
      "Difficulty demonstrating real-time content recommendations",
      "Need to show cross-platform audience unification",
      "Ad monetization requires precise audience segmentation",
    ],
    solutions: [
      "Intent prediction surfaces trending content before users search",
      "Second-page personalization adapts content feeds in real-time",
      "Audience segmentation demos for advertising partnerships",
      "Cross-device identity resolution for streaming platforms",
    ],
    scenarios: [
      {
        name: "Content Personalization",
        description: "Dynamic content feeds adapt based on viewing history, genre preferences, and engagement patterns.",
      },
      {
        name: "Subscriber Engagement",
        description: "Behavioral triggers identify at-risk subscribers and surface retention offers proactively.",
      },
      {
        name: "Audience Segmentation",
        description: "Precise audience cohorts demonstrate advertising value to media buyers and partners.",
      },
      {
        name: "Cross-Platform Identity",
        description: "Unified profiles across mobile, web, and connected TV demonstrate the full audience picture.",
      },
    ],
    metrics: [
      { value: "45%", label: "Reduction in demo complexity" },
      { value: "2.1x", label: "Increase in prospect engagement" },
      { value: "38%", label: "Higher content relevance in demos" },
      { value: "67%", label: "Faster time-to-value demonstration" },
    ],
  },
];
