export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "build" | "collaborate" | "deliver";
}

export const features: Feature[] = [
  {
    id: "ai-prompts",
    title: "AI-Powered Prompt Engine",
    description:
      "Generate step-by-step build instructions with exact code blocks, dependencies, and architecture patterns — tailored to each prospect.",
    icon: "Sparkles",
    category: "build",
  },
  {
    id: "multi-architecture",
    title: "Multi-Architecture Support",
    description:
      "Toggle SE Sidebar, seeded profiles, Profile API, intent predictions, and second-page personalization to match any demo scenario.",
    icon: "Layers",
    category: "build",
  },
  {
    id: "industry-scenarios",
    title: "Industry-Tailored Scenarios",
    description:
      "Pre-built personalization scenarios for E-commerce, B2B SaaS, FinTech, and Media — each mapped to real Segment CDP capabilities.",
    icon: "Target",
    category: "build",
  },
  {
    id: "demo-scripts",
    title: "SE Demo Scripts",
    description:
      "Auto-generated click-path narratives with talking points, aha moments, and closing strategies — ready for live prospect demos.",
    icon: "Presentation",
    category: "deliver",
  },
  {
    id: "wizard-builder",
    title: "4-Step Wizard Builder",
    description:
      "Guided workflow from context gathering to credential injection. Build a complete playbook in under 5 minutes.",
    icon: "Wand2",
    category: "build",
  },
  {
    id: "share-export",
    title: "Share & Export",
    description:
      "Share playbooks via URL with your team, export to Markdown, or print professionally formatted documentation.",
    icon: "Share2",
    category: "collaborate",
  },
  {
    id: "version-pinning",
    title: "Dependency Version Pinning",
    description:
      "Automatically fetches latest stable versions from NPM. Every generated prompt uses exact version locks for reproducible builds.",
    icon: "Pin",
    category: "build",
  },
  {
    id: "credential-security",
    title: "Credential Security",
    description:
      "API keys and tokens are held in-memory only — never persisted to storage or logged. Sanitized placeholders stored in database.",
    icon: "Shield",
    category: "deliver",
  },
  {
    id: "team-playbooks",
    title: "Team Playbook Library",
    description:
      "Build a shared library of demo playbooks across your SE team. Track completion progress and iterate on successful patterns.",
    icon: "Users",
    category: "collaborate",
  },
  {
    id: "admin-templates",
    title: "Template Management",
    description:
      "Admin panel for managing prompt templates with versioning. Create, archive, and update templates without code changes.",
    icon: "Settings",
    category: "collaborate",
  },
  {
    id: "real-time-compilation",
    title: "Real-Time Compilation",
    description:
      "Watch your playbook compile in real-time with progress indicators. Multi-phase generation ensures comprehensive coverage.",
    icon: "Zap",
    category: "build",
  },
  {
    id: "dark-mode",
    title: "Dark Mode Native",
    description:
      "Full dark mode support throughout the application. Generated code blocks and demo scripts optimized for readability.",
    icon: "Moon",
    category: "deliver",
  },
];

export const featureCategories = [
  { id: "build" as const, label: "Build", description: "Create demos faster" },
  { id: "collaborate" as const, label: "Collaborate", description: "Work with your team" },
  { id: "deliver" as const, label: "Deliver", description: "Impress prospects" },
];
