export interface ScenarioDetail {
  events: string[];
  codeSnippet: string;
  beforeDescription: string;
  afterDescription: string;
}

/**
 * Rich details for each scenario, keyed by scenario name.
 * These power the interactive scenario explorer cards on /use-cases/[slug].
 */
export const scenarioDetails: Record<string, ScenarioDetail> = {
  // E-commerce
  "Second-Page Personalization": {
    events: [
      'track("Product Viewed", { category, product_id })',
      'track("Page Viewed", { path: "/", referrer })',
      'identify(userId, { favorite_category })',
    ],
    codeSnippet: `// Hero banner adapts based on prior Product Viewed event
const traits = await profileAPI.getTraits(userId);
const category = traits.favorite_category || "default";
return <HeroBanner variant={category} />;`,
    beforeDescription: "Every visitor sees the same generic homepage hero banner regardless of browsing behavior.",
    afterDescription: "Hero dynamically adapts product recommendations based on the visitor's previous page views and category interest.",
  },
  "Cart Abandonment Recovery": {
    events: [
      'track("Product Added", { product_id, price })',
      'track("Cart Viewed", { items_count, total })',
      'track("Cart Abandoned", { items_count, value })',
    ],
    codeSnippet: `// Push notification after 30s of inactivity
useEffect(() => {
  const timer = setTimeout(() => {
    if (cartItems.length > 0 && !hasActivity) {
      showNotification({ items: cartItems });
      analytics.track("Cart Abandonment Triggered");
    }
  }, 30000);
}, [cartItems, hasActivity]);`,
    beforeDescription: "Abandoned carts go unrecovered. No mechanism to re-engage users who leave mid-purchase.",
    afterDescription: "Triggered notifications with personalized messaging recapture abandoned carts within the optimal 30-second engagement window.",
  },
  "Authenticated VIP State": {
    events: [
      'identify(userId, { tier: "VIP", ltv: 2400 })',
      'track("Signed In", { method: "email" })',
      'track("VIP Offer Shown", { discount_pct: 15 })',
    ],
    codeSnippet: `// Remove shipping cost when user identified as VIP
const traits = useSegmentTraits();
const isVIP = traits?.tier === "VIP";
return (
  <ShippingBadge free={isVIP} />
);`,
    beforeDescription: "High-value customers get the same experience as first-time visitors. No loyalty recognition.",
    afterDescription: "Recognized high-value customers see exclusive pricing, free shipping badges, and priority support on login.",
  },
  "Intent Prediction Upsell": {
    events: [
      'track("Product Viewed", { category, view_count: 4 })',
      'track("Feature Used", { feature: "compare" })',
      'track("Upsell Modal Shown", { intent_score: 87 })',
    ],
    codeSnippet: `// Surface cross-sell modal at peak intent
const score = useIntentScore(userId);
if (score > 80) {
  showUpsellModal({ products: recommendations });
  analytics.track("Upsell Modal Shown", { intent_score: score });
}`,
    beforeDescription: "Upsell offers are shown randomly or never. No understanding of purchase readiness.",
    afterDescription: "AI-driven behavioral scoring surfaces cross-sell modals at the moment of highest purchase intent.",
  },

  // B2B SaaS
  "Group-Level Context": {
    events: [
      'group("org_456", { plan: "Enterprise", seats: 50 })',
      'track("Page Viewed", { section: "admin" })',
      'identify(userId, { role: "admin" })',
    ],
    codeSnippet: `// Render admin tabs only for Enterprise tier
const org = useSegmentGroup();
const showAdmin = org?.plan === "Enterprise";
return (
  <Tabs>
    <Tab>Dashboard</Tab>
    {showAdmin && <Tab>Admin</Tab>}
  </Tabs>
);`,
    beforeDescription: "All users see the same UI regardless of their organization's plan or role.",
    afterDescription: "Organization-based UI adaptations show enterprise features to qualifying accounts automatically.",
  },
  "PII Masking & Governance": {
    events: [
      'track("Form Submitted", { ssn: "***-**-1234" })',
      'track("PII Detected", { field: "ssn", action: "masked" })',
    ],
    codeSnippet: `// Client-side middleware scrubs PII before Segment
analytics.addSourceMiddleware(({ payload, next }) => {
  const props = payload.obj.properties;
  if (props?.ssn) props.ssn = maskPII(props.ssn);
  next(payload);
});`,
    beforeDescription: "Sensitive data flows unmasked through the event pipeline, creating compliance risk.",
    afterDescription: "Automated data classification and masking demonstrate Segment's privacy controls to compliance teams.",
  },
  "PII Masking": {
    events: [
      'track("Form Submitted", { ssn: "***-**-1234" })',
      'track("PII Detected", { field: "ssn", action: "masked" })',
    ],
    codeSnippet: `// Client-side middleware scrubs PII before Segment
analytics.addSourceMiddleware(({ payload, next }) => {
  const props = payload.obj.properties;
  if (props?.ssn) props.ssn = maskPII(props.ssn);
  next(payload);
});`,
    beforeDescription: "Sensitive data flows unmasked through the event pipeline, creating compliance risk.",
    afterDescription: "Data governance controls demonstrate compliance readiness for privacy-conscious technical buyers.",
  },
  "Profile API Integration": {
    events: [
      'track("Feature Used", { feature: "profile-lookup" })',
      'identify(userId, { plan: "Pro", usage_pct: 78 })',
    ],
    codeSnippet: `// Real-time trait lookup via Profile API
const res = await fetch(
  \`https://profiles.segment.com/v1/spaces/\${spaceId}/\${userId}/traits\`,
  { headers: { Authorization: \`Basic \${token}\` } }
);
const traits = await res.json();`,
    beforeDescription: "Personalization relies on stale batch data, hours or days behind real user behavior.",
    afterDescription: "Live trait lookups power real-time personalization decisions at the API level.",
  },
  "Real-Time Event Stream": {
    events: [
      'track("Button Clicked", { label: "Add to Cart" })',
      'page("Product Detail", { product_id: "sku-123" })',
    ],
    codeSnippet: `// SE Sidebar visualizes events in real-time
<SESidebar>
  <EventStream maxEvents={50} />
  <TraitInspector userId={currentUser} />
  <SegmentDebugger />
</SESidebar>`,
    beforeDescription: "No way to show prospects the event pipeline during a live demo.",
    afterDescription: "SE Sidebar visualizes the event pipeline in real-time during the demo, making the invisible visible.",
  },

  // FinTech
  "Secure Credential Handling": {
    events: [
      'track("Keys Injected", { field_count: 4 })',
      'track("Session Ended", { keys_cleared: true })',
    ],
    codeSnippet: `// In-memory only — never persisted
const [keys, setKeys] = useState<Keys | null>(null);
// On unmount, keys are garbage collected
useEffect(() => () => setKeys(null), []);`,
    beforeDescription: "API keys stored in config files, git repos, or environment variables with no cleanup.",
    afterDescription: "In-memory-only processing with automatic sanitization proves enterprise-grade security posture.",
  },
  "Account Tier Personalization": {
    events: [
      'identify(userId, { tier: "Premium", portfolio_value: "$250K" })',
      'track("Loan Application Started", { pre_approved: true })',
    ],
    codeSnippet: `// Product experience adapts based on customer tier
const traits = useSegmentTraits();
const tier = traits?.tier || "Standard";
return <LoanUI preApproved={tier === "Premium"} />;`,
    beforeDescription: "Every customer sees the same financial product offerings regardless of their value or risk profile.",
    afterDescription: "Product experiences adapt based on customer tier, portfolio value, and risk profile.",
  },
  "Cross-Channel Identity": {
    events: [
      'identify(userId, { channels: ["web", "mobile", "branch"] })',
      'track("Branch Visit", { location: "NYC-001" })',
    ],
    codeSnippet: `// Unified customer view across touchpoints
const profile = await unify.getProfile(userId);
// profile.channels: ["web", "mobile", "branch"]
// profile.identities: [email, phone, account_id]`,
    beforeDescription: "Customer interactions are siloed by channel with no unified view.",
    afterDescription: "Unified customer view across web, mobile, and branch interactions.",
  },

  // Media
  "Content Personalization": {
    events: [
      'track("Content Viewed", { genre: "Sci-Fi", duration_s: 3400 })',
      'track("Content Completed", { content_id: "ep-42" })',
    ],
    codeSnippet: `// Dynamic content feeds based on viewing history
const affinity = useContentAffinity(userId);
const feed = sortByAffinity(catalog, affinity);
return <ContentGrid items={feed} />;`,
    beforeDescription: "Everyone sees the same content feed. No personalization based on viewing habits.",
    afterDescription: "Dynamic content feeds adapt based on viewing history, genre preferences, and engagement patterns.",
  },
  "Subscriber Engagement": {
    events: [
      'track("Subscription Renewed", { plan: "Annual" })',
      'track("Churn Risk Detected", { risk_score: 0.85 })',
    ],
    codeSnippet: `// Behavioral triggers identify at-risk subscribers
const risk = useChurnScore(userId);
if (risk > 0.7) {
  showRetentionOffer({ discount: "20%", plan: "annual" });
  analytics.track("Retention Offer Shown", { risk_score: risk });
}`,
    beforeDescription: "Subscribers churn silently. No proactive intervention or retention strategy.",
    afterDescription: "Behavioral triggers identify at-risk subscribers and surface retention offers proactively.",
  },
  "Audience Segmentation": {
    events: [
      'track("Ad Impression", { campaign: "Q4-launch", segment: "sports-fans" })',
      'group("advertiser_123", { budget: "$50K", target: "18-34" })',
    ],
    codeSnippet: `// Precise audience cohorts for ad partners
const cohort = await audiences.getCohort("sports-fans");
// cohort.size: 145000
// cohort.overlap: ["news-readers", "mobile-heavy"]`,
    beforeDescription: "Audience targeting relies on broad demographics. Advertisers can't see granular cohorts.",
    afterDescription: "Precise audience cohorts demonstrate advertising value to media buyers and partners.",
  },
  "Cross-Platform Identity": {
    events: [
      'identify(userId, { devices: ["iOS", "web", "tvOS"] })',
      'track("Cross-Device Session", { origin: "mobile", target: "TV" })',
    ],
    codeSnippet: `// Unified profiles across all platforms
const profile = await unify.getProfile(userId);
// profile.devices: ["iOS 17", "Chrome 120", "Apple TV"]
// profile.sessions_7d: 14`,
    beforeDescription: "Each device is treated as a separate user. No cross-platform identity resolution.",
    afterDescription: "Unified profiles across mobile, web, and connected TV demonstrate the full audience picture.",
  },
};
