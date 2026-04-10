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
    id: "starter",
    name: "Starter",
    price: "$0",
    annualPrice: "$0",
    period: "/month",
    description: "Perfect for individual SEs getting started with demo automation.",
    features: [
      "Up to 5 playbooks",
      "4-step wizard builder",
      "SE demo script generation",
      "Markdown export",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/login",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    annualPrice: "$39",
    period: "/month",
    description: "For SE teams who need advanced features and collaboration.",
    features: [
      "Unlimited playbooks",
      "All Starter features",
      "Team sharing & collaboration",
      "Custom prompt templates",
      "Priority support",
      "Admin panel access",
      "Version history",
    ],
    cta: "Start Free Trial",
    href: "/login",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Custom solutions for large SE organizations with advanced needs.",
    features: [
      "Everything in Pro",
      "SSO / SAML authentication",
      "Custom integrations",
      "Dedicated success manager",
      "SLA guarantee",
      "Custom branding",
      "On-premise deployment option",
      "Advanced analytics",
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
];

export const pricingFaq = [
  {
    question: "Can I try it before committing?",
    answer:
      "Absolutely. The Starter plan is free forever with up to 5 playbooks. Start building demos today with zero risk.",
  },
  {
    question: "How does team sharing work?",
    answer:
      "On Pro and Enterprise plans, you can share playbooks via URL with anyone on your team. They can view, duplicate, and iterate on your work.",
  },
  {
    question: "What happens to my data if I downgrade?",
    answer:
      "Your playbooks remain accessible. On the Starter plan, you're limited to 5 active playbooks but can still view all existing ones.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes, annual billing saves you 20%. The Pro plan drops from $49/month to $39/month when billed annually.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Credentials are never persisted — they exist in-memory only during compilation and are sanitized before storage. We use Supabase with row-level security.",
  },
];
