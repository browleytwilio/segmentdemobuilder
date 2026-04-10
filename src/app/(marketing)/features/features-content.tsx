"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { FeatureCard } from "@/components/marketing/sections/feature-card";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { features, featureCategories } from "@/lib/marketing/data/features";
import { cn } from "@/lib/utils";
import { SplitComparison } from "@/components/marketing/sections/split-comparison";

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
        <SplitComparison />
      </SectionWrapper>

      <CTASection
        heading="See every feature in action"
        description="Start building your first playbook and experience the full power of demo automation."
      />
    </>
  );
}
