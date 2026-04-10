export interface PricingTier {
  id: string;
  name: string;
  price: string;
  annualPrice?: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "twilio-se",
    name: "Twilio SE Access",
    price: "Free",
    period: "for all Twilio SEs",
    description:
      "Full access to every feature — wizard builder, natural language mode, AI Copilot, scenario recommendations, and admin tools. Available to every @twilio.com account.",
    features: [
      "Unlimited playbooks",
      "Natural Language Builder",
      "AI Segment Copilot",
      "AI scenario recommendations with impact scoring",
      "Team playbook library",
      "Admin template management with AI refinement",
      "Live demo credential rehydration",
      "SE demo script generation",
    ],
    cta: "Sign In with Twilio",
    href: "/sign-in",
    popular: true,
  },
];

export const pricingFaq = [
  {
    question: "Who can access the Demo Builder?",
    answer:
      "Any Twilio employee with an @twilio.com email address. Sign in with Clerk and you'll be provisioned automatically.",
  },
  {
    question: "Is there a playbook limit?",
    answer:
      "No. Every account gets unlimited playbooks. Build as many as you need for your prospect pipeline.",
  },
  {
    question: "How are my credentials handled?",
    answer:
      "Credentials are never persisted — they exist in-memory only during compilation and are sanitized before storage. We use Supabase with row-level security so your playbooks are only visible to you unless you share them.",
  },
  {
    question: "Can I share playbooks with colleagues?",
    answer:
      "Yes. Every completed playbook has a shareable URL. Anyone with a Twilio account can view a shared playbook. You can also export to Markdown or print for offline use.",
  },
  {
    question: "How do I get admin access?",
    answer:
      "Admin access (for managing prompt templates and demo features) is granted by an existing super_admin. Reach out to the SE Enablement team to request access.",
  },
];
