"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { CTASection } from "@/components/marketing/sections/cta-section";
import {
  integrations,
  integrationCategories,
} from "@/lib/marketing/data/integrations";
import { cn } from "@/lib/utils";

export function IntegrationsContent() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? integrations
      : integrations.filter((i) => i.category === activeCategory);

  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            Integrations
          </p>
          <GradientHeading as="h1">
            The Segment ecosystem, demo-ready
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Generate demos that showcase any combination of Segment sources,
            destinations, and platform tools.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        {/* Category filter */}
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
            All ({integrations.length})
          </button>
          {integrationCategories.map((cat) => (
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
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Integration grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((integration, i) => {
            const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[integration.icon] ?? LucideIcons.Puzzle;
            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-white/[0.15]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Icon className="h-5 w-5 text-marketing-blue" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {integration.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-white/[0.05] px-2 py-0.5 text-xs text-muted-foreground/70 capitalize">
                    {integration.category}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </SectionWrapper>

      {/* How it connects */}
      <SectionWrapper background="muted">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            How it connects
          </h2>
          <p className="mb-12 text-muted-foreground">
            The Demo Builder generates code that works with any Segment integration.
            Your demo app sends events to Segment, which routes them to any destination.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-4 text-sm font-medium text-foreground">
              Your Demo App
            </div>
            <div className="text-muted-foreground/40">&rarr;</div>
            <div className="rounded-xl border border-marketing-blue/30 bg-marketing-blue/10 px-6 py-4 text-sm font-medium text-foreground">
              Segment CDP
            </div>
            <div className="text-muted-foreground/40">&rarr;</div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-4 text-sm font-medium text-foreground">
              300+ Destinations
            </div>
          </div>
        </div>
      </SectionWrapper>

      <CTASection
        heading="Build an integration demo"
        description="Show your prospects exactly how Segment connects their stack."
      />
    </>
  );
}
