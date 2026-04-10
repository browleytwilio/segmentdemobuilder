export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export const navLinks: (NavLink | NavGroup)[] = [
  {
    label: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Integrations", href: "/integrations" },
      { label: "Security", href: "/security" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Solutions",
    links: [
      { label: "E-commerce & Retail", href: "/use-cases/ecommerce" },
      { label: "B2B SaaS", href: "/use-cases/b2b-saas" },
      { label: "FinTech", href: "/use-cases/fintech" },
      { label: "Media & Entertainment", href: "/use-cases/media" },
    ],
  },
  { label: "Docs", href: "https://segment-demo-builder.mintlify.app" },
  {
    label: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
      { label: "Customers", href: "/customers" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integrations", href: "/integrations" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Customers", href: "/customers" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Documentation", href: "https://segment-demo-builder.mintlify.app" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "Security", href: "/security" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function isNavGroup(item: NavLink | NavGroup): item is NavGroup {
  return "links" in item;
}
