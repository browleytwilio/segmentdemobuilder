"use client";

import { motion } from "framer-motion";
import { UserCircle, Layers, Target, Zap } from "lucide-react";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";

const steps = [
  {
    icon: UserCircle,
    title: "Define Context",
    description: "Enter your prospect's name, industry, and target persona. The engine tailors every output to their world.",
    color: "marketing-blue",
  },
  {
    icon: Layers,
    title: "Choose Architecture",
    description: "Toggle SE Sidebar, seeded profiles, Profile API, and more. Only build what your demo needs.",
    color: "marketing-purple",
  },
  {
    icon: Target,
    title: "Select Scenarios",
    description: "Pick from industry-tailored personalization scenarios — each mapped to real CDP capabilities.",
    color: "marketing-cyan",
  },
  {
    icon: Zap,
    title: "Generate Playbook",
    description: "AI compiles your choices into step-by-step build prompts and a complete SE demo script.",
    color: "marketing-green",
  },
];

export function HomeHowItWorks() {
  return (
    <SectionWrapper background="gradient" id="how-it-works">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-purple">
          How It Works
        </p>
        <GradientHeading as="h2">
          Build the perfect demo, your way
        </GradientHeading>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Use the guided wizard for full control, or describe your demo in plain English and let AI fill in the rest. Either way, you get a complete playbook in minutes.
        </p>
      </motion.div>

      {/* NL Builder callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mb-16 max-w-2xl"
      >
        <div className="rounded-2xl border border-marketing-purple/20 bg-marketing-purple/[0.05] p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-marketing-purple">
              Try the Natural Language Builder
            </span>
            <svg className="h-3.5 w-3.5 text-marketing-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </div>
          <p className="text-sm italic text-muted-foreground">
            &ldquo;I&apos;m demoing Segment for a FinTech CMO focused on real-time personalization and compliance.&rdquo;
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60">
            AI extracts the context, selects architecture flags, and recommends scenarios — automatically.
          </p>
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-4xl">
        {/* Connecting line */}
        <div className="absolute left-8 top-8 hidden h-[calc(100%-2rem)] w-px lg:left-1/2 lg:block">
          <div className="h-full w-full bg-gradient-to-b from-marketing-blue/40 via-marketing-purple/30 to-transparent" />
        </div>

        <div className="space-y-12 lg:space-y-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex items-start gap-6 lg:gap-12 ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              <div className={`flex-1 ${i % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="group inline-block rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05]"
                >
                  <div
                    className={`inline-flex items-center gap-3 ${
                      i % 2 === 0 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.04] transition-all duration-300 group-hover:border-${step.color}/20 group-hover:bg-${step.color}/[0.08]`}>
                      <step.icon className={`h-5 w-5 text-${step.color}`} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              </div>

              {/* Center node */}
              <div className="relative hidden lg:mt-10 lg:block lg:shrink-0">
                <div className="animate-glow-pulse absolute -inset-1.5 rounded-full bg-marketing-blue/20 blur-sm" />
                <div className="relative h-4 w-4 rounded-full border-2 border-marketing-blue bg-background" />
              </div>

              <div className="hidden flex-1 lg:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
