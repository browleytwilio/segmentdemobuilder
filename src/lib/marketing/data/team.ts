export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  featured?: boolean;
}

export const team: TeamMember[] = [
  {
    name: "Blake Rowley",
    role: "Senior Manager, Product Specialists Asia Pacific & Japan",
    bio: "Builder of the Segment Demo Builder. Blake leads Product Specialists across APJ, helping SE teams deliver world-class Segment CDP demonstrations. Passionate about developer tools and demo automation.",
    featured: true,
  },
  {
    name: "Sarah Chen",
    role: "VP Solutions Engineering",
    bio: "Former SE leader at three unicorn startups. Sarah brings deep expertise in scaling SE organizations and building repeatable demo processes.",
  },
  {
    name: "Marcus Rivera",
    role: "Senior SE Manager",
    bio: "Enterprise SE veteran specializing in FinTech and regulated industries. Marcus designed the compliance-first scenario framework.",
  },
  {
    name: "Priya Patel",
    role: "Solutions Architect",
    bio: "Full-stack engineer turned SA. Priya built the AI prompt compilation engine and the template variable substitution system.",
  },
  {
    name: "Kenji Tanaka",
    role: "Regional SE Lead, APJ",
    bio: "Based in Tokyo, Kenji has deep expertise in the APJ market and has helped localize demo scenarios for the region.",
  },
  {
    name: "Anya Volkov",
    role: "SE Enablement Lead",
    bio: "Former Segment customer turned SE. Anya focuses on onboarding, training, and ensuring every new SE can produce quality demos from day one.",
  },
];

export const companyValues = [
  {
    title: "SEs Build for SEs",
    description: "We're practitioners first. Every feature comes from real pain points in real demo workflows.",
    icon: "Hammer",
  },
  {
    title: "Speed Is Respect",
    description: "Every minute saved on demo prep is a minute back with family, hobbies, or strategic work. We treat SE time as sacred.",
    icon: "Clock",
  },
  {
    title: "Quality Is Non-Negotiable",
    description: "Automated doesn't mean generic. Every generated playbook should be indistinguishable from one crafted by a senior SE.",
    icon: "Award",
  },
  {
    title: "Security by Default",
    description: "Credentials are never persisted. Data is always sanitized. Privacy isn't a feature — it's a foundation.",
    icon: "Lock",
  },
];
