"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { PricingCard } from "@/components/marketing/sections/pricing-card";
import { FAQSection } from "@/components/marketing/sections/faq-section";
import { pricingTiers, pricingFaq } from "@/lib/marketing/data/pricing";

export function PricingContent() {
  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            Access
          </p>
          <GradientHeading as="h1">
            Free for every Twilio SE
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Sign in with your @twilio.com account and get full access to every feature — no tiers, no limits.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper className="pt-0">
        <div className="mx-auto max-w-md">
          {pricingTiers.map((tier, i) => (
            <PricingCard
              key={tier.id}
              name={tier.name}
              price={tier.price}
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
          title="Common questions"
          items={pricingFaq}
        />
      </SectionWrapper>
    </>
  );
}
