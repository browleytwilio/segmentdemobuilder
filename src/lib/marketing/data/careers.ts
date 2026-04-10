export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

export const jobs: Job[] = [
  {
    id: "se-1",
    title: "Senior Solutions Engineer",
    department: "Solutions Engineering",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    description: "Join our SE team to help enterprise customers realize the full potential of Segment CDP. You'll build custom demos, contribute to the playbook library, and shape the future of demo automation.",
  },
  {
    id: "eng-1",
    title: "Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (US/EU)",
    type: "Full-time",
    description: "Build and scale the Demo Builder platform. You'll work with Next.js, TypeScript, Supabase, and AI-powered prompt generation systems.",
  },
  {
    id: "eng-2",
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    description: "Improve our prompt compilation engine with advanced NLP techniques. Optimize scenario generation and build intelligent template systems.",
  },
  {
    id: "design-1",
    title: "Product Designer",
    department: "Design",
    location: "New York, NY (Hybrid)",
    type: "Full-time",
    description: "Own the end-to-end design experience for SEs. From the builder wizard to the playbook viewer, you'll shape how thousands of SEs prepare for demos.",
  },
  {
    id: "pm-1",
    title: "Product Manager, Platform",
    department: "Product",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    description: "Drive the product roadmap for our platform capabilities — collaboration features, admin tools, and template management systems.",
  },
];

export const benefits = [
  { title: "Competitive Salary", description: "Top-of-market compensation with equity", icon: "DollarSign" },
  { title: "Remote Flexible", description: "Work from anywhere with flexible hours", icon: "Globe" },
  { title: "Health & Wellness", description: "Comprehensive health, dental, and vision", icon: "Heart" },
  { title: "Learning Budget", description: "$5,000 annual learning and conference budget", icon: "GraduationCap" },
  { title: "Unlimited PTO", description: "Take the time you need to recharge", icon: "Palmtree" },
  { title: "Home Office Setup", description: "$2,500 stipend for your workspace", icon: "Monitor" },
];
