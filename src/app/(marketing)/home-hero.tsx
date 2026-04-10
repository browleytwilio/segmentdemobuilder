"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBadge } from "@/components/marketing/sections/hero-badge";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-blue/8 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-marketing-purple/6 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroBadge>Now in Public Beta</HeroBadge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8"
          >
            <GradientHeading as="h1">
              Build Segment demos in minutes, not hours
            </GradientHeading>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            AI-powered playbook generation for Sales Engineers.
            Create personalized, industry-tailored CDP demo guides
            with exact code, architecture patterns, and demo scripts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              render={<Link href="/login" />}
              className="bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-90"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/how-it-works" />}>
              <Play className="mr-2 h-4 w-4" />
              See How It Works
            </Button>
          </motion.div>
        </div>

        {/* Product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 shadow-2xl">
            <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#0a0a0a]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-white/10" />
                  <div className="h-3 w-3 rounded-full bg-white/10" />
                  <div className="h-3 w-3 rounded-full bg-white/10" />
                </div>
                <div className="mx-auto rounded-md bg-white/[0.05] px-12 py-1 text-xs text-muted-foreground">
                  app.demobuilder.io
                </div>
              </div>
              {/* Fake app UI */}
              <div className="grid grid-cols-12 gap-4 p-6">
                <div className="col-span-3 space-y-3">
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-3/4 rounded bg-white/[0.06]" />
                  <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
                  <div className="mt-4 h-3 w-full rounded bg-marketing-blue/20" />
                  <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
                </div>
                <div className="col-span-9 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-marketing-blue/30 to-marketing-purple/30" />
                    <div className="h-3 w-48 rounded bg-white/10" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                        <div className="mb-2 h-2 w-12 rounded bg-marketing-blue/20" />
                        <div className="h-2 w-full rounded bg-white/[0.06]" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-white/[0.06]" />
                      <div className="h-2 w-5/6 rounded bg-white/[0.06]" />
                      <div className="h-2 w-4/6 rounded bg-white/[0.06]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
