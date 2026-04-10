import type { Metadata } from "next";
import { Shield, Lock, Eye, Server, Key, Database } from "lucide-react";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { FAQSection } from "@/components/marketing/sections/faq-section";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { AnimatedSection } from "@/components/marketing/animations/animated-section";
import { securityFaq } from "@/lib/marketing/data/faq";

export const metadata: Metadata = {
  title: "Security | Segment Demo Builder",
  description:
    "In-memory-only credential handling, row-level security, and enterprise-grade data protection.",
};

const principles = [
  {
    icon: Key,
    title: "In-Memory Credentials",
    description:
      "API keys and tokens exist only in browser memory during compilation. They are never written to localStorage, cookies, or the database. When you close the tab, they're gone.",
  },
  {
    icon: Database,
    title: "Automatic Sanitization",
    description:
      "Before any data reaches the database, credentials are replaced with placeholder variables like {{SEGMENT_WRITE_KEY}}. The stored playbook contains zero sensitive data.",
  },
  {
    icon: Lock,
    title: "Row-Level Security",
    description:
      "PostgreSQL RLS policies ensure every user can only access their own playbooks. Admin roles are explicitly granted and verified server-side — no client-side role checks.",
  },
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Supabase Auth with email/password, OAuth (Google, GitHub), and magic link support. All sessions are server-validated with httpOnly cookies.",
  },
  {
    icon: Eye,
    title: "No Analytics on Credentials",
    description:
      "Our Segment analytics integration explicitly excludes credential fields from any tracking events. Keys are never in any event payload.",
  },
  {
    icon: Server,
    title: "Rate Limiting",
    description:
      "API endpoints are protected with Upstash Redis rate limiting. Brute force protection and abuse prevention are built into every public endpoint.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-green">
            Security
          </p>
          <GradientHeading as="h1">
            Security isn&apos;t a feature — it&apos;s a foundation
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Your credentials never touch persistent storage. Our architecture is
            designed around a simple principle: what doesn&apos;t exist can&apos;t be
            breached.
          </p>
        </div>
      </SectionWrapper>

      {/* Credential flow diagram */}
      <SectionWrapper>
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            How credentials flow
          </h2>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-center text-sm">
              <p className="font-medium text-foreground">You enter keys</p>
              <p className="text-xs text-muted-foreground">In browser memory</p>
            </div>
            <span className="text-muted-foreground/40 rotate-90 sm:rotate-0">&rarr;</span>
            <div className="rounded-xl border border-marketing-blue/30 bg-marketing-blue/10 px-5 py-3 text-center text-sm">
              <p className="font-medium text-foreground">Compilation</p>
              <p className="text-xs text-muted-foreground">Keys used in-memory</p>
            </div>
            <span className="text-muted-foreground/40 rotate-90 sm:rotate-0">&rarr;</span>
            <div className="rounded-xl border border-marketing-green/30 bg-marketing-green/10 px-5 py-3 text-center text-sm">
              <p className="font-medium text-foreground">Sanitization</p>
              <p className="text-xs text-muted-foreground">Keys → placeholders</p>
            </div>
            <span className="text-muted-foreground/40 rotate-90 sm:rotate-0">&rarr;</span>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-center text-sm">
              <p className="font-medium text-foreground">Database</p>
              <p className="text-xs text-muted-foreground">No real keys stored</p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Security principles */}
      <SectionWrapper background="dots">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Security Principles
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => (
            <AnimatedSection key={p.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-2.5">
                  <p.icon className="h-5 w-5 text-marketing-green" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <FAQSection title="Security FAQ" items={securityFaq} />
      </SectionWrapper>

      <CTASection
        heading="Security questions?"
        description="Our team is happy to walk you through our security architecture in detail."
        primaryCta={{ label: "Contact Us", href: "/contact" }}
        secondaryCta={{ label: "Get Started Free", href: "/sign-in" }}
      />
    </>
  );
}
