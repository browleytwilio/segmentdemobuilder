export interface FAQItem {
  question: string;
  answer: string;
}

export const generalFaq: FAQItem[] = [
  {
    question: "What is Segment Demo Builder?",
    answer: "Segment Demo Builder is an AI-powered tool that helps Sales Engineers create customized Segment CDP demo playbooks in minutes. It generates step-by-step build instructions and SE demo scripts tailored to each prospect's industry and role.",
  },
  {
    question: "Who is this tool for?",
    answer: "It's built specifically for Solutions Engineers, Sales Engineers, and Solutions Architects who demo Segment CDP to prospects. Anyone involved in technical pre-sales will benefit.",
  },
  {
    question: "How long does it take to create a playbook?",
    answer: "The average playbook creation takes under 5 minutes using the 4-step wizard. Compare that to the 4+ hours of manual demo preparation it replaces.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. API keys and credentials are held in-memory only — never persisted to storage or logged. We sanitize all sensitive data before database storage and use Supabase with row-level security.",
  },
  {
    question: "Can I share playbooks with my team?",
    answer: "Yes. On Pro and Enterprise plans, you can share playbooks via URL. Team members can view, duplicate, and iterate on shared playbooks.",
  },
];

export const howItWorksFaq: FAQItem[] = [
  {
    question: "Do I need to know how to code?",
    answer: "No. The Demo Builder generates all the code for you in step-by-step prompts. You just follow the instructions or feed them to an AI coding assistant.",
  },
  {
    question: "What industries are supported?",
    answer: "Currently, we have pre-built scenarios for E-commerce & Retail, B2B SaaS, FinTech, and Media & Entertainment. More industries are added regularly.",
  },
  {
    question: "Can I customize the generated prompts?",
    answer: "On Pro and Enterprise plans, admins can create and manage custom prompt templates through the admin panel. Templates support variable substitution for dynamic content.",
  },
  {
    question: "What's included in the SE demo script?",
    answer: "The script includes an opening narrative, click-path steps for each scenario, aha moments to highlight, talking points per persona, and a closing strategy.",
  },
];

export const securityFaq: FAQItem[] = [
  {
    question: "How are API keys handled?",
    answer: "All credentials (Segment write keys, Profile API tokens, etc.) exist in-memory only during the compilation phase. They are never written to localStorage, cookies, or the database. After compilation, credentials are replaced with sanitized placeholders.",
  },
  {
    question: "What database security measures are in place?",
    answer: "We use Supabase with PostgreSQL and Row Level Security (RLS). Each user can only access their own playbooks. Admin roles are explicitly granted and verified server-side.",
  },
  {
    question: "Is the application SOC 2 compliant?",
    answer: "We follow SOC 2 principles in our architecture and data handling. Enterprise customers can request our security documentation and compliance reports.",
  },
  {
    question: "Can I self-host the application?",
    answer: "Enterprise plans include an on-premise deployment option. Contact our sales team for architecture details and requirements.",
  },
];
