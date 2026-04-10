"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { PricingCard } from "@/components/marketing/sections/pricing-card";
import { FAQSection } from "@/components/marketing/sections/faq-section";
import { pricingTiers, pricingFaq } from "@/lib/marketing/data/pricing";
import { cn } from "@/lib/utils";

export function PricingContent() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            Pricing
          </p>
          <GradientHeading as="h1">
            Simple, transparent pricing
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Start free. Upgrade when your team grows. No surprises.
          </p>

          {/* Annual toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm transition-colors",
                !annual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                annual ? "bg-marketing-blue" : "bg-white/20"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  annual ? "translate-x-5.5" : "translate-x-0.5"
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm transition-colors",
                annual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Annual
              <span className="ml-1 text-marketing-green">Save 20%</span>
            </span>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="pt-0">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => (
            <PricingCard
              key={tier.id}
              name={tier.name}
              price={annual && tier.annualPrice ? tier.annualPrice : tier.price}
              period={tier.period}
              description={tier.description}
              features={tier.features}
              cta={tier.cta}
              href={tier.href}
              popular={tier.popular}
              index={i}
            />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <FAQSection
          title="Pricing FAQ"
          items={pricingFaq}
        />
      </SectionWrapper>
    </>
  );
}
