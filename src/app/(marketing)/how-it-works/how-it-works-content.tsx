"use client";

import { motion } from "framer-motion";
import { UserCircle, Layers, Target, Zap, ArrowDown } from "lucide-react";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { CodeBlockDisplay } from "@/components/marketing/sections/code-block-display";
import { FAQSection } from "@/components/marketing/sections/faq-section";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { howItWorksFaq } from "@/lib/marketing/data/faq";
import { WizardPreview } from "@/components/marketing/sections/wizard-preview";

const steps = [
  {
    icon: UserCircle,
    title: "Step 1: Define Context",
    description:
      "Enter your prospect's company name, select their industry, and choose the target persona. The engine uses this context to tailor every generated output.",
    details: [
      "Customer name personalizes all code examples and copy",
      "Industry selection loads relevant scenarios and patterns",
      "Persona choice shapes the demo script narrative and talking points",
    ],
    color: "text-marketing-blue",
  },
  {
    icon: Layers,
    title: "Step 2: Choose Architecture",
    description:
      "Toggle the demo capabilities you need. Each toggle activates a distinct architecture component in the generated code.",
    details: [
      "SE Sidebar — real-time event stream visualization",
      "Seeded Profiles — pre-populated demo user data",
      "Profile API — live trait lookups for personalization",
      "Intent Predictions — AI-driven behavioral scoring",
    ],
    color: "text-marketing-purple",
  },
  {
    icon: Target,
    title: "Step 3: Select Scenarios",
    description:
      "Pick from industry-specific personalization scenarios. Each scenario generates dedicated code and a demo script section.",
    details: [
      "Second-page personalization, cart abandonment, VIP states",
      "PII masking, group-level context, intent prediction",
      "Each scenario maps to real Segment CDP capabilities",
      "Custom scenarios available on Enterprise plans",
    ],
    color: "text-marketing-green",
  },
  {
    icon: Zap,
    title: "Step 4: Generate & Use",
    description:
      "The AI engine compiles your selections into a complete playbook with build prompts and a demo script. Follow the prompts or share with your team.",
    details: [
      "Step-by-step build instructions with exact code blocks",
      "Auto-pinned dependency versions from NPM",
      "SE demo script with click-paths and aha moments",
      "Export to Markdown or share via URL",
    ],
    color: "text-marketing-cyan",
  },
];

const sampleCode = `// Generated playbook prompt (simplified)
{
  step: 1,
  title: "Project Scaffolding",
  prompt: \`Create a Next.js application for
    Acme Corp's E-commerce demo.

    npx create-next-app@15.1.0 acme-demo
    cd acme-demo
    npm install @segment/analytics-next@1.76.0

    Initialize Segment with write key:
    {{SEGMENT_WRITE_KEY}}\`
}`;

export function HowItWorksContent() {
  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-purple">
            How It Works
          </p>
          <GradientHeading as="h1">
            From context to playbook in four steps
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            The guided wizard captures everything the AI engine needs to generate
            a complete, personalized demo playbook. No coding required.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="mx-auto max-w-3xl space-y-8">
          {steps.map((step, i) => (
            <div key={step.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {step.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {step.details.map((detail) => (
                        <li
                          key={detail}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className={`mt-1 ${step.color}`}>&#x2022;</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="h-5 w-5 text-muted-foreground/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Interactive wizard preview */}
      <SectionWrapper background="dots">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">
            Try it yourself
          </h2>
          <p className="mt-3 text-muted-foreground">
            Walk through the wizard right here — no sign-in required.
          </p>
        </div>
        <WizardPreview />
      </SectionWrapper>

      <SectionWrapper background="muted">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            What you get
          </h2>
          <p className="mb-12 text-muted-foreground">
            Here&apos;s a preview of the generated output structure.
          </p>
        </div>
        <div className="mx-auto max-w-3xl">
          <CodeBlockDisplay
            code={sampleCode}
            title="playbook-output.json"
          />
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <FAQSection items={howItWorksFaq} />
      </SectionWrapper>

      <CTASection
        heading="Ready to build your first playbook?"
        description="It takes less than 5 minutes. No credit card required."
      />
    </>
  );
}
