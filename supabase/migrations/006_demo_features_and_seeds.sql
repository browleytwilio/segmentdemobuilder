-- PRD 7: demo_features table and seed data for dynamic CMS

-- 1. demo_features table
CREATE TABLE public.demo_features (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry           TEXT NOT NULL,
  slug               TEXT NOT NULL,
  label              TEXT NOT NULL,
  description        TEXT NOT NULL,
  prompt_template_id UUID NOT NULL REFERENCES public.prompt_templates(id),
  display_order      INTEGER NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (industry, slug)
);

CREATE INDEX idx_demo_features_industry ON public.demo_features(industry) WHERE is_active = true;

-- 2. RLS for demo_features
ALTER TABLE public.demo_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active features"
  ON public.demo_features FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Super-admins can insert features"
  ON public.demo_features FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super-admins can update features"
  ON public.demo_features FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- 3. Trigger
CREATE TRIGGER demo_features_updated_at
  BEFORE UPDATE ON public.demo_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. Seed prompt_templates (9 scenario templates with {{VARIABLE}} placeholders)
-- Using deterministic UUIDs so demo_features can reference them.

INSERT INTO public.prompt_templates (id, name, category, content, version, is_active) VALUES

-- Scenario 1: Second-Page Personalization
('a0000001-0001-4000-8000-000000000001', 'Second-Page Personalization', 'scenario', $TPL$# Scenario: Second-Page Personalization

Build a personalized hero banner that changes based on what the user viewed previously.

## 1. Track Product Views

On each product page, fire a Segment `track` call:

```tsx
import { analytics } from "@/components/providers/analytics-provider";

function handleProductView(product: { id: string; name: string; category: string }) {
  analytics.track("Product Viewed", {
    product_id: product.id,
    product_name: product.name,
    category: product.category,
  });
  sessionStorage.setItem("last_viewed_category", product.category);
  sessionStorage.setItem("last_viewed_product", product.name);
}
```

## 2. Personalized Hero Banner

Create `src/components/hero/personalized-hero.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

const HERO_VARIANTS: Record<string, { headline: string; cta: string; bgClass: string }> = {
  Electronics: { headline: "Top picks in Electronics", cta: "Shop Tech Deals", bgClass: "bg-blue-600" },
  Apparel: { headline: "Trending Styles for You", cta: "Explore Fashion", bgClass: "bg-pink-600" },
  default: { headline: "Welcome to {{CUSTOMER_NAME}}", cta: "Start Shopping", bgClass: "bg-primary" },
};

export function PersonalizedHero() {
  const [variant, setVariant] = useState(HERO_VARIANTS.default);

  useEffect(() => {
    const category = sessionStorage.getItem("last_viewed_category");
    if (category && HERO_VARIANTS[category]) {
      setVariant(HERO_VARIANTS[category]);
    }
  }, []);

  return (
    <section className={`${variant.bgClass} rounded-xl p-12 text-white text-center`}>
      <h1 className="text-3xl font-bold">{variant.headline}</h1>
      <button className="mt-4 rounded-lg bg-white px-6 py-2 text-sm font-medium text-foreground">
        {variant.cta}
      </button>
    </section>
  );
}
```

## 3. Integration

Replace the static hero on the homepage with `<PersonalizedHero />`. Navigate to a product page, then return to the homepage — the hero should reflect the last viewed category.
$TPL$, 1, true),

-- Scenario 2: Authenticated VIP State
('a0000001-0002-4000-8000-000000000002', 'Authenticated VIP State', 'scenario', $TPL$# Scenario: Authenticated VIP State

Remove shipping costs instantly when a user is identified as a VIP via Segment `identify`.

## 1. Identify the VIP User

On login or profile fetch, fire an `identify` call with the `vip` trait:

```tsx
import { analytics } from "@/components/providers/analytics-provider";

async function handleLogin(user: { id: string; email: string; isVip: boolean }) {
  await analytics.identify(user.id, {
    email: user.email,
    vip: user.isVip,
    customer: "{{CUSTOMER_NAME}}",
  });
}
```

## 2. Shipping Cost Component

Create `src/components/cart/shipping-line.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { analytics } from "@/components/providers/analytics-provider";

export function ShippingLine({ baseShipping = 9.99 }: { baseShipping?: number }) {
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    analytics.user().then((user) => {
      const traits = user.traits() ?? {};
      setIsVip(traits.vip === true);
    });
  }, []);

  if (isVip) {
    return (
      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span className="text-green-600 font-medium">FREE (VIP)</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between text-sm">
      <span>Shipping</span>
      <span>${baseShipping.toFixed(2)}</span>
    </div>
  );
}
```

## 3. Demo Flow

1. Show the cart with standard shipping cost.
2. Log in as a VIP user (triggers `identify` with `vip: true`).
3. The shipping line instantly changes to "FREE (VIP)".
$TPL$, 1, true),

-- Scenario 3: Cart Abandonment Recovery
('a0000001-0003-4000-8000-000000000003', 'Cart Abandonment Recovery', 'scenario', $TPL$# Scenario: Cart Abandonment Recovery

Simulate a push notification triggered by a stale cart state.

## 1. Track Cart State

```tsx
import { analytics } from "@/components/providers/analytics-provider";

function trackCartUpdate(items: Array<{ id: string; name: string; price: number }>) {
  analytics.track("Cart Updated", {
    products: items,
    cart_value: items.reduce((sum, i) => sum + i.price, 0),
    item_count: items.length,
  });
}

function trackCartAbandoned(items: Array<{ id: string; name: string; price: number }>) {
  analytics.track("Cart Abandoned", {
    products: items,
    cart_value: items.reduce((sum, i) => sum + i.price, 0),
    abandoned_after_seconds: 30,
  });
}
```

## 2. Abandonment Detection & Notification

Create `src/components/cart/abandonment-notifier.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

export function AbandonmentNotifier({ cartItemCount }: { cartItemCount: number }) {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (cartItemCount === 0) return;
    const timer = setTimeout(() => setShowNotification(true), 30_000);
    return () => clearTimeout(timer);
  }, [cartItemCount]);

  if (!showNotification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border bg-background p-4 shadow-xl animate-in slide-in-from-bottom-4">
      <p className="text-sm font-medium">Forgot something?</p>
      <p className="text-xs text-muted-foreground mt-1">
        You have {cartItemCount} item(s) waiting in your {{CUSTOMER_NAME}} cart.
      </p>
      <button
        onClick={() => setShowNotification(false)}
        className="mt-2 text-xs text-primary underline"
      >
        Return to Cart
      </button>
    </div>
  );
}
```
$TPL$, 1, true),

-- Scenario 4: Intent Prediction Upsell
('a0000001-0004-4000-8000-000000000004', 'Intent Prediction Upsell', 'scenario', $TPL$# Scenario: Intent Prediction Upsell

Inject a "Talk to Sales" modal based on high-usage traits from Segment Predictions.

## 1. Check Usage Traits

Create a server component or API route that reads the user's prediction scores:

```ts
// src/app/api/upsell-check/route.ts
import { getIntentPredictions } from "@/lib/segment/predictions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ shouldUpsell: false });

  const scores = await getIntentPredictions(userId);
  return Response.json({
    shouldUpsell: scores.likelihood_to_purchase > 0.7,
    scores,
  });
}
```

## 2. Upsell Modal

Create `src/components/modals/upsell-modal.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UpsellModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/upsell-check?userId=${userId}`)
      .then((r) => r.json())
      .then(({ shouldUpsell }) => { if (shouldUpsell) setOpen(true); });
  }, [userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ready to Scale?</DialogTitle>
          <DialogDescription>
            Based on your usage patterns, {{CUSTOMER_NAME}}'s Enterprise plan could save your team significant time.
          </DialogDescription>
        </DialogHeader>
        <Button className="w-full">Talk to Sales</Button>
      </DialogContent>
    </Dialog>
  );
}
```
$TPL$, 1, true),

-- Scenario 5: Group-Level Context
('a0000001-0005-4000-8000-000000000005', 'Group-Level Context', 'scenario', $TPL$# Scenario: Group-Level Context

Render Admin tabs conditionally based on the user's Segment `group()` call.

## 1. Fire the Group Call

On workspace load, associate the user with their organization:

```tsx
import { analytics } from "@/components/providers/analytics-provider";

function handleWorkspaceLoad(org: { id: string; name: string; plan: string }) {
  analytics.group(org.id, {
    name: org.name,
    plan: org.plan,
    industry: "{{INDUSTRY}}",
  });
  sessionStorage.setItem("org_plan", org.plan);
}
```

## 2. Conditional Admin Tabs

Create `src/components/nav/admin-tabs.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

export function AdminTabs() {
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    setPlan(sessionStorage.getItem("org_plan"));
  }, []);

  if (plan !== "Enterprise") return null;

  return (
    <nav className="flex gap-2 border-b pb-2">
      <button className="text-sm font-medium px-3 py-1 rounded-md bg-muted">User Management</button>
      <button className="text-sm font-medium px-3 py-1 rounded-md bg-muted">Audit Log</button>
      <button className="text-sm font-medium px-3 py-1 rounded-md bg-muted">SSO Settings</button>
    </nav>
  );
}
```

## 3. Demo Flow

1. Load the workspace as a "Pro" user — Admin tabs are hidden.
2. Switch to an "Enterprise" group — Admin tabs appear instantly.
$TPL$, 1, true),

-- Scenario 6: Edge-based PII Masking
('a0000001-0006-4000-8000-000000000006', 'Edge-based PII Masking', 'scenario', $TPL$# Scenario: Edge-based PII Masking

Demonstrate client-side payload scrubbing that strips PII before data reaches Segment.

## 1. Analytics Middleware

Create `src/lib/segment/pii-middleware.ts`:

```ts
import type { Context, Plugin } from "@segment/analytics-next";

const PII_FIELDS = ["ssn", "social_security", "credit_card", "date_of_birth", "phone_number"];

function maskValue(value: string): string {
  if (value.length <= 4) return "****";
  return "*".repeat(value.length - 4) + value.slice(-4);
}

export const piiMaskingPlugin: Plugin = {
  name: "PII Masking",
  type: "enrichment",
  version: "1.0.0",
  isLoaded: () => true,
  load: () => Promise.resolve(),
  track: (ctx: Context) => {
    const props = ctx.event.properties ?? {};
    for (const field of PII_FIELDS) {
      if (typeof props[field] === "string") {
        props[field] = maskValue(props[field]);
      }
    }
    return ctx;
  },
  identify: (ctx: Context) => {
    const traits = ctx.event.traits ?? {};
    for (const field of PII_FIELDS) {
      if (typeof traits[field] === "string") {
        traits[field] = maskValue(traits[field]);
      }
    }
    return ctx;
  },
};
```

## 2. Register the Plugin

In your Analytics provider, register the plugin:

```tsx
import { piiMaskingPlugin } from "@/lib/segment/pii-middleware";
analytics.register(piiMaskingPlugin);
```

## 3. Demo Flow

Fire a `track("Form Submitted", { ssn: "123-45-6789" })` — in the SE Sidebar, verify the SSN appears as `*****6789`.
$TPL$, 1, true),

-- Scenario 7: Risk Profile Gating
('a0000001-0007-4000-8000-000000000007', 'Risk Profile Gating', 'scenario', $TPL$# Scenario: Risk Profile Gating

Restrict loan UI components based on real-time credit trait updates from Segment.

## 1. Credit Trait Check

```ts
// src/app/api/credit-check/route.ts
import { getProfileTraits } from "@/lib/segment/profile-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ eligible: false, reason: "No user ID" });

  const traits = await getProfileTraits(userId);
  const creditScore = Number(traits.credit_score ?? 0);
  const riskLevel = String(traits.risk_level ?? "unknown");

  return Response.json({
    eligible: creditScore >= 650 && riskLevel !== "high",
    creditScore,
    riskLevel,
  });
}
```

## 2. Gated Loan UI

Create `src/components/finance/loan-panel.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

export function LoanPanel({ userId }: { userId: string }) {
  const [state, setState] = useState<{ eligible: boolean; creditScore: number; riskLevel: string } | null>(null);

  useEffect(() => {
    fetch(`/api/credit-check?userId=${userId}`)
      .then((r) => r.json())
      .then(setState);
  }, [userId]);

  if (!state) return <div className="animate-pulse h-32 rounded-xl bg-muted" />;

  if (!state.eligible) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h3 className="font-semibold">Loan Products Unavailable</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Based on your current risk profile (score: {state.creditScore}, level: {state.riskLevel}), loan products are not available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
      <h3 className="font-semibold text-green-700">You're Pre-Approved!</h3>
      <p className="text-sm text-muted-foreground mt-1">Credit score: {state.creditScore}. Explore loan options below.</p>
    </div>
  );
}
```
$TPL$, 1, true),

-- Scenario 8: Content Affinity Engine
('a0000001-0008-4000-8000-000000000008', 'Content Affinity Engine', 'scenario', $TPL$# Scenario: Content Affinity Engine

Dynamically reorder homepage categories based on computed content affinity scores.

## 1. Track Content Engagement

```tsx
import { analytics } from "@/components/providers/analytics-provider";

function trackContentView(contentId: string, category: string, duration: number) {
  analytics.track("Content Viewed", {
    content_id: contentId,
    category,
    view_duration_seconds: duration,
    customer: "{{CUSTOMER_NAME}}",
  });
}
```

## 2. Compute Affinity Scores Client-Side

Create `src/lib/affinity/compute.ts`:

```ts
const STORAGE_KEY = "content_affinity";

interface AffinityMap {
  [category: string]: { views: number; totalDuration: number };
}

export function recordView(category: string, duration: number) {
  const data: AffinityMap = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (!data[category]) data[category] = { views: 0, totalDuration: 0 };
  data[category].views++;
  data[category].totalDuration += duration;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getRankedCategories(allCategories: string[]): string[] {
  const data: AffinityMap = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return [...allCategories].sort((a, b) => {
    const scoreA = (data[a]?.views ?? 0) * 2 + (data[a]?.totalDuration ?? 0) * 0.1;
    const scoreB = (data[b]?.views ?? 0) * 2 + (data[b]?.totalDuration ?? 0) * 0.1;
    return scoreB - scoreA;
  });
}
```

## 3. Dynamic Homepage

```tsx
"use client";

import { useEffect, useState } from "react";
import { getRankedCategories } from "@/lib/affinity/compute";

const ALL_CATEGORIES = ["News", "Sports", "Entertainment", "Technology", "Lifestyle"];

export function DynamicHomepage() {
  const [categories, setCategories] = useState(ALL_CATEGORIES);

  useEffect(() => {
    setCategories(getRankedCategories(ALL_CATEGORIES));
  }, []);

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <section key={cat} className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">{cat}</h2>
          <p className="text-sm text-muted-foreground">Top stories in {cat}...</p>
        </section>
      ))}
    </div>
  );
}
```
$TPL$, 1, true),

-- Scenario 9: Paywall Thresholds
('a0000001-0009-4000-8000-000000000009', 'Paywall Thresholds', 'scenario', $TPL$# Scenario: Paywall Thresholds

Trigger a subscription paywall after exactly 3 anonymous article views.

## 1. Track Article Views

```tsx
import { analytics } from "@/components/providers/analytics-provider";

function trackArticleView(articleId: string, title: string) {
  const count = Number(localStorage.getItem("article_view_count") || "0") + 1;
  localStorage.setItem("article_view_count", String(count));

  analytics.track("Article Viewed", {
    article_id: articleId,
    title,
    view_number: count,
    customer: "{{CUSTOMER_NAME}}",
  });
}
```

## 2. Paywall Gate

Create `src/components/paywall/paywall-gate.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { analytics } from "@/components/providers/analytics-provider";

const FREE_ARTICLE_LIMIT = 3;

export function PaywallGate({ children, articleId, title }: {
  children: React.ReactNode;
  articleId: string;
  title: string;
}) {
  const [viewCount, setViewCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const count = Number(localStorage.getItem("article_view_count") || "0") + 1;
    localStorage.setItem("article_view_count", String(count));
    setViewCount(count);
    setIsBlocked(count > FREE_ARTICLE_LIMIT);

    analytics.track("Article Viewed", { article_id: articleId, title, view_number: count });
  }, [articleId, title]);

  if (isBlocked) {
    return (
      <div className="relative">
        <div className="max-h-48 overflow-hidden blur-sm">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur">
          <h3 className="text-xl font-bold">You've reached your free article limit</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Subscribe to {{CUSTOMER_NAME}} for unlimited access.
          </p>
          <button className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
            Subscribe Now
          </button>
          <p className="text-xs text-muted-foreground mt-2">{viewCount} of {FREE_ARTICLE_LIMIT} free articles used</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        {FREE_ARTICLE_LIMIT - viewCount} free article(s) remaining
      </p>
      {children}
    </div>
  );
}
```
$TPL$, 1, true);

-- 5. Seed demo_features (9 rows mapping to the templates above)

INSERT INTO public.demo_features (id, industry, slug, label, description, prompt_template_id, display_order) VALUES
  ('b0000001-0001-4000-8000-000000000001', 'E-commerce / Retail', 'second-page-personalization', 'Second-Page Personalization', 'Swap hero banner based on prior Product Viewed event', 'a0000001-0001-4000-8000-000000000001', 1),
  ('b0000001-0002-4000-8000-000000000002', 'E-commerce / Retail', 'authenticated-vip-state', 'Authenticated VIP State', 'Show free shipping when a user is identified as VIP', 'a0000001-0002-4000-8000-000000000002', 2),
  ('b0000001-0003-4000-8000-000000000003', 'E-commerce / Retail', 'cart-abandonment-recovery', 'Cart Abandonment Recovery', 'Trigger notification when cart items are abandoned', 'a0000001-0003-4000-8000-000000000003', 3),
  ('b0000001-0004-4000-8000-000000000004', 'B2B SaaS', 'intent-prediction-upsell', 'Intent Prediction Upsell', 'Surface "Talk to Sales" modal based on usage predictions', 'a0000001-0004-4000-8000-000000000004', 1),
  ('b0000001-0005-4000-8000-000000000005', 'B2B SaaS', 'group-level-context', 'Group-Level Context', 'Render Admin tabs only if group() registers Enterprise tier', 'a0000001-0005-4000-8000-000000000005', 2),
  ('b0000001-0006-4000-8000-000000000006', 'FinTech', 'edge-pii-masking', 'Edge-based PII Masking', 'Client-side payload scrubbing before data reaches Segment', 'a0000001-0006-4000-8000-000000000006', 1),
  ('b0000001-0007-4000-8000-000000000007', 'FinTech', 'risk-profile-gating', 'Risk Profile Gating', 'Gate loan products based on real-time credit traits', 'a0000001-0007-4000-8000-000000000007', 2),
  ('b0000001-0008-4000-8000-000000000008', 'Media & Entertainment', 'content-affinity-engine', 'Content Affinity Engine', 'Reorder homepage categories based on viewing affinity', 'a0000001-0008-4000-8000-000000000008', 1),
  ('b0000001-0009-4000-8000-000000000009', 'Media & Entertainment', 'paywall-thresholds', 'Paywall Thresholds', 'Trigger subscription paywall after 3 anonymous views', 'a0000001-0009-4000-8000-000000000009', 2);
