"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  primaryCta = { label: "Get Started Free", href: "/login" },
  secondaryCta,
  className,
}: CTASectionProps) {
  return (
    <section className={cn("relative overflow-hidden py-24 lg:py-32", className)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-blue/8 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-3xl px-6 text-center lg:px-8"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            render={<Link href={primaryCta.href} />}
            className="bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-90"
          >
            {primaryCta.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {secondaryCta && (
            <Button size="lg" variant="outline" render={<Link href={secondaryCta.href} />}>
              {secondaryCta.label}
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
