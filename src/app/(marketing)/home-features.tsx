"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { FeatureCard } from "@/components/marketing/sections/feature-card";
import { BentoGrid, BentoItem } from "@/components/marketing/sections/bento-grid";
import { features } from "@/lib/marketing/data/features";

export function HomeFeatures() {
  const topFeatures = features.slice(0, 6);

  return (
    <SectionWrapper background="dots" id="features">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
          Features
        </p>
        <GradientHeading as="h2">
          Everything SEs need to win
        </GradientHeading>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          From AI-powered prompt generation to team collaboration, every feature
          is designed to make your next demo the best one yet.
        </p>
      </motion.div>

      <BentoGrid>
        {topFeatures.map((feature, i) => (
          <BentoItem key={feature.id} span={i < 2 ? "default" : "default"}>
            <FeatureCard
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={i}
              className="h-full"
            />
          </BentoItem>
        ))}
      </BentoGrid>
    </SectionWrapper>
  );
}
