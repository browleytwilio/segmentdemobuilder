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
  },
  {
    icon: Layers,
    title: "Choose Architecture",
    description: "Toggle SE Sidebar, seeded profiles, Profile API, and more. Only build what your demo needs.",
  },
  {
    icon: Target,
    title: "Select Scenarios",
    description: "Pick from industry-tailored personalization scenarios — each mapped to real CDP capabilities.",
  },
  {
    icon: Zap,
    title: "Generate Playbook",
    description: "AI compiles your choices into step-by-step build prompts and a complete SE demo script.",
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
          Four steps to a perfect demo
        </GradientHeading>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          The guided wizard captures everything the prompt engine needs.
          No coding required — just answers about your prospect.
        </p>
      </motion.div>

      <div className="relative mx-auto max-w-4xl">
        {/* Connecting line */}
        <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-marketing-blue/40 via-marketing-purple/40 to-transparent lg:left-1/2 lg:block" />

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
                <div
                  className={`inline-flex items-center gap-3 ${
                    i % 2 === 0 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <step.icon className="h-5 w-5 text-marketing-blue" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>

              {/* Center dot */}
              <div className="hidden h-4 w-4 shrink-0 rounded-full border-2 border-marketing-blue bg-background lg:mt-4 lg:block" />

              <div className="hidden flex-1 lg:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
