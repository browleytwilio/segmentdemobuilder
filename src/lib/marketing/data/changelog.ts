export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  type: "feature" | "improvement" | "fix";
  items: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "2.4.0",
    date: "2026-04-05",
    title: "Marketing Site Launch",
    description: "Complete SaaS marketing website with new landing pages, blog, and documentation.",
    type: "feature",
    items: [
      "Full marketing website with 16 interconnected pages",
      "Cursor-inspired dark theme design system",
      "Animated sections with Framer Motion",
      "Blog with markdown rendering and categories",
      "Pricing page with tier comparison",
    ],
  },
  {
    version: "2.3.0",
    date: "2026-03-20",
    title: "Segment Analytics Integration",
    description: "Full analytics tracking across the application with automatic page views and event tracking.",
    type: "feature",
    items: [
      "Analytics.js snippet loading with write key configuration",
      "Automatic page view tracking on route changes",
      "User identification on authentication",
      "Event tracking for key user actions (CTA clicks, playbook creation, etc.)",
      "Analytics provider component for app-wide tracking",
    ],
  },
  {
    version: "2.2.0",
    date: "2026-03-08",
    title: "Team Collaboration Features",
    description: "Share playbooks with your team via URL and collaborate on demo preparation.",
    type: "feature",
    items: [
      "Shareable playbook URLs with public access",
      "Team playbook library with search and filters",
      "Playbook duplication for template reuse",
      "Export to Markdown for offline use",
    ],
  },
  {
    version: "2.1.0",
    date: "2026-02-22",
    title: "Admin Panel & Template Management",
    description: "Full admin interface for managing users, prompt templates, and demo features.",
    type: "feature",
    items: [
      "User management with role-based access",
      "Prompt template editor with versioning",
      "Demo feature configurator per industry",
      "Template archive and restoration",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-02-10",
    title: "Database-Driven Templates",
    description: "Migrated from hardcoded prompts to database-driven template system.",
    type: "improvement",
    items: [
      "Prompt templates stored in Supabase with versioning",
      "Template variable substitution engine",
      "Industry-specific scenario management",
      "Backwards-compatible migration from v1",
    ],
  },
  {
    version: "1.5.0",
    date: "2026-01-28",
    title: "SE Demo Scripts",
    description: "Auto-generated demo scripts with click-paths, talking points, and aha moments.",
    type: "feature",
    items: [
      "Click-path narrative generation per scenario",
      "Persona-specific talking points",
      "Opening and closing script sections",
      "Setup checklist for demo preparation",
    ],
  },
  {
    version: "1.4.0",
    date: "2026-01-15",
    title: "Dependency Version Pinning",
    description: "Automatic NPM version fetching ensures reproducible builds.",
    type: "improvement",
    items: [
      "Real-time NPM registry lookups",
      "ISR caching with 1-hour revalidation",
      "Fallback versions for offline resilience",
      "Rate limiting on version API endpoint",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-01-02",
    title: "Credential Security Overhaul",
    description: "In-memory-only credential handling with automatic sanitization.",
    type: "improvement",
    items: [
      "Credentials never persisted to localStorage or database",
      "Automatic sanitization to placeholder variables",
      "Rehydration modal for post-creation credential injection",
      "Security audit compliance",
    ],
  },
];
