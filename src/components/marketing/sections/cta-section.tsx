"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";

interface CTASectionProps {
  heading: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
}

export function CTASection({
  heading,
  description,
  primaryCta = { label: "Get Started Free", href: "/sign-in" },
  secondaryCta,
  className,
}: CTASectionProps) {
  return (
    <section className={cn("relative overflow-hidden py-24 lg:py-36", className)}>
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-aurora absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-blue/[0.12] blur-[100px]" />
        <div className="animate-aurora-2 absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/3 -translate-y-1/2 rounded-full bg-marketing-purple/[0.10] blur-[80px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-3xl px-6 text-center lg:px-8"
      >
        {/* Decorative line above */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.10]" />
          <div className="h-1.5 w-1.5 rounded-full bg-marketing-blue/60" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.10]" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 px-4 sm:flex-row sm:items-center sm:gap-4 sm:px-0">
          <div className="group relative">
            <div className="animate-glow-pulse absolute -inset-0.5 rounded-xl bg-gradient-to-r from-marketing-blue to-marketing-purple opacity-60 blur-sm" />
            <Button
              size="lg"
              render={<Link href={primaryCta.href} />}
              onClick={() =>
                trackEvent("CTA Clicked", {
                  cta: primaryCta.label,
                  location: "cta_section",
                })
              }
              className="relative w-full overflow-hidden bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-95 sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                {primaryCta.label}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
              <span className="animate-shimmer-sweep pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Button>
          </div>
          {secondaryCta && (
            <Button
              size="lg"
              variant="outline"
              render={<Link href={secondaryCta.href} />}
              onClick={() =>
                trackEvent("CTA Clicked", {
                  cta: secondaryCta.label,
                  location: "cta_section",
                })
              }
              className="w-full border-white/[0.12] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/20 sm:w-auto"
            >
              {secondaryCta.label}
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
