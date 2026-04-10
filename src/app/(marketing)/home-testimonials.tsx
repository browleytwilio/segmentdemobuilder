"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { TestimonialCard } from "@/components/marketing/sections/testimonial-card";
import { testimonials } from "@/lib/marketing/data/testimonials";

export function HomeTestimonials() {
  return (
    <SectionWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-green">
          From the SE Org
        </p>
        <GradientHeading as="h2">
          What Twilio SEs say about demo prep
        </GradientHeading>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.slice(0, 6).map((t, i) => (
          <TestimonialCard
            key={t.id}
            quote={t.quote}
            name={t.name}
            role={t.role}
            company={t.company}
            index={i}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
