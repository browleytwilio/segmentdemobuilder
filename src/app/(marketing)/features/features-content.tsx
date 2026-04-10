"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { FeatureCard } from "@/components/marketing/sections/feature-card";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { features, featureCategories } from "@/lib/marketing/data/features";
import { cn } from "@/lib/utils";

export function FeaturesContent() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? features
      : features.filter((f) => f.category === activeCategory);

  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            Features
          </p>
          <GradientHeading as="h1">
            Built for the SE workflow
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Every feature is designed by SEs, for SEs. From AI-powered prompt
            generation to team-wide playbook management.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        {/* Category tabs */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              activeCategory === "all"
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Features
          </button>
          {featureCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors",
                activeCategory === cat.id
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Feature grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((feature, i) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={i}
              className="h-full"
            />
          ))}
        </motion.div>
      </SectionWrapper>

      {/* Before / After comparison */}
      <SectionWrapper background="muted">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-4xl">
            Before vs. After
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
              <h3 className="mb-6 text-lg font-semibold text-red-400/80">
                Without Demo Builder
              </h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400/60">&#x2717;</span>
                  4+ hours of manual demo preparation
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400/60">&#x2717;</span>
                  Inconsistent quality across SE team
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400/60">&#x2717;</span>
                  Generic demos for every industry
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400/60">&#x2717;</span>
                  No standardized demo scripts
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400/60">&#x2717;</span>
                  6+ weeks to onboard new SEs
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-marketing-green/20 bg-marketing-green/[0.03] p-8">
              <h3 className="mb-6 text-lg font-semibold text-marketing-green">
                With Demo Builder
              </h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-marketing-green">&#x2713;</span>
                  15-minute playbook generation
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-marketing-green">&#x2713;</span>
                  Standardized quality from day one
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-marketing-green">&#x2713;</span>
                  Industry-tailored scenarios
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-marketing-green">&#x2713;</span>
                  Auto-generated SE demo scripts
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-marketing-green">&#x2713;</span>
                  2-week new SE ramp time
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      <CTASection
        heading="See every feature in action"
        description="Start building your first playbook and experience the full power of demo automation."
      />
    </>
  );
}
