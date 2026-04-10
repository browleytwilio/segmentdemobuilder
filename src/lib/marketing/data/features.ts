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
      "Generate step-by-step build instructions with exact code blocks, dependencies, and architecture patterns — tailored to each prospect. Each prompt is automatically enriched with industry-specific context and persona-adapted technical depth during compilation.",
    icon: "Sparkles",
    category: "build",
  },
  {
    id: "nl-builder",
    title: "Natural Language Builder",
    description:
      "Describe your demo in plain English — AI parses your intent, selects the right architecture flags, and recommends matching scenarios. Skip the wizard entirely and go straight to a tailored playbook.",
    icon: "MessageSquare",
    category: "build",
  },
  {
    id: "ai-scenario-intelligence",
    title: "AI Scenario Intelligence",
    description:
      "Not sure which scenarios fit best? AI analyzes your prospect's industry and persona, then ranks the top scenarios with reasoning and an impact score. One click to apply the full recommendation set.",
    icon: "BrainCircuit",
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
    id: "wizard-builder",
    title: "4-Step Wizard Builder",
    description:
      "Guided workflow from context gathering to credential injection. Build a complete playbook in under 5 minutes.",
    icon: "Wand2",
    category: "build",
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
    id: "real-time-compilation",
    title: "Real-Time Compilation",
    description:
      "Watch your playbook compile across five phases — dependency fetching, template compilation, AI enrichment, saving, and redirect. Per-phase timing keeps you informed.",
    icon: "Zap",
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
      "Admin panel for managing prompt templates with versioning and AI-assisted refinement. Describe what you want changed in plain English — the AI rewrites the template while preserving all {{VARIABLE}} placeholders.",
    icon: "Settings",
    category: "collaborate",
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
    id: "ai-copilot",
    title: "AI Segment Copilot",
    description:
      "Your always-on Segment expert. Ask questions mid-demo, get instant context on Profile API, Engage, Protocols, and any CDP capability — without leaving the app.",
    icon: "Bot",
    category: "deliver",
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
    id: "credential-rehydration",
    title: "Live Demo Rehydration",
    description:
      "Playbooks store sanitized placeholders — inject your real Segment write keys and tokens on-demand when it's demo time. Credentials are replaced client-side only and cleared when you close the session.",
    icon: "KeyRound",
    category: "deliver",
  },
];

export const featureCategories = [
  { id: "build" as const, label: "Build", description: "Create demos faster" },
  { id: "collaborate" as const, label: "Collaborate", description: "Work with your team" },
  { id: "deliver" as const, label: "Deliver", description: "Impress prospects" },
];
