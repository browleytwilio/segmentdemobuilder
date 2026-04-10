"use client";

import { motion } from "framer-motion";
import {
  PlayCircleIcon,
  ClipboardListIcon,
  CodeIcon,
  RocketIcon,
  CheckCircleIcon,
} from "lucide-react";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { CTASection } from "@/components/marketing/sections/cta-section";

const timeline = [
  {
    icon: ClipboardListIcon,
    time: "0:00",
    title: "Start the Wizard",
    description:
      "Open the builder and enter your prospect details — company name, industry, and persona. The wizard pre-fills smart defaults so you can move fast.",
    color: "text-marketing-blue",
    bg: "bg-marketing-blue/10",
  },
  {
    icon: CodeIcon,
    time: "1:30",
    title: "Configure Architecture",
    description:
      "Toggle the capabilities your demo needs — SE Sidebar, Seeded Profiles, Profile API, Intent Predictions. Each toggle maps to real Segment CDP features.",
    color: "text-marketing-purple",
    bg: "bg-marketing-purple/10",
  },
  {
    icon: PlayCircleIcon,
    time: "3:00",
    title: "Select Scenarios & Compile",
    description:
      "Pick industry-specific scenarios like cart abandonment or VIP detection. Hit compile and the AI engine generates your full playbook with step-by-step prompts.",
    color: "text-marketing-green",
    bg: "bg-marketing-green/10",
  },
  {
    icon: RocketIcon,
    time: "5:00",
    title: "Review & Share",
    description:
      "Walk through the generated prompts, export the demo script to Markdown, or share a link with your team. Your playbook is ready to present.",
    color: "text-marketing-cyan",
    bg: "bg-marketing-cyan/10",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15 },
  }),
};

export function WalkthroughContent() {
  return (
    <>
      <SectionWrapper className="pt-32 pb-16 lg:pt-44 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GradientHeading as="h1" gradient="default">
              See It In Action
            </GradientHeading>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground"
          >
            Follow an SE through a real demo-prep scenario — from blank slate to
            a complete Segment playbook in under five minutes.
          </motion.p>
        </div>
      </SectionWrapper>

      <SectionWrapper className="pb-24">
        <div className="relative mx-auto max-w-2xl">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-marketing-blue/40 via-marketing-purple/30 to-transparent" />

          <div className="space-y-12">
            {timeline.map((step, i) => (
              <motion.div
                key={step.time}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                className="relative flex gap-6 pl-2"
              >
                {/* Icon dot */}
                <div
                  className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border ${step.bg} ${step.color}`}
                >
                  <step.icon className="size-5" />
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-semibold ${step.color}`}
                    >
                      {step.time}
                    </span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Done marker */}
            <motion.div
              custom={timeline.length}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative flex items-center gap-6 pl-2"
            >
              <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-marketing-green/10 text-marketing-green">
                <CheckCircleIcon className="size-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Playbook complete — ready to demo.
              </p>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      <CTASection
        heading="Ready to try it yourself?"
        description="Sign in with your Twilio account and build your first playbook in under 5 minutes."
        primaryCta={{ label: "Get Started", href: "/sign-in" }}
        secondaryCta={{ label: "How It Works", href: "/how-it-works" }}
      />
    </>
  );
}
