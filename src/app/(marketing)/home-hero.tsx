"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HeroBadge } from "@/components/marketing/sections/hero-badge";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { trackEvent } from "@/lib/analytics/events";

export function HomeHero() {
  const containerRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
      mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  const orb1X = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const orb1Y = useTransform(springY, [-0.5, 0.5], [-30, 30]);
  const orb2X = useTransform(springX, [-0.5, 0.5], [30, -30]);
  const orb2Y = useTransform(springY, [-0.5, 0.5], [20, -20]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-36"
    >
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Radial vignette overlay */}
        <div className="absolute inset-0 bg-radial-[at_50%_0%] from-transparent via-transparent to-background/80" />

        {/* Drifting orbs — mouse-parallax */}
        <motion.div
          style={{ x: orb1X, y: orb1Y }}
          className="animate-aurora absolute left-1/4 top-[-100px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-marketing-blue/[0.12] blur-[120px]"
        />
        <motion.div
          style={{ x: orb2X, y: orb2Y }}
          className="animate-aurora-2 absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-marketing-purple/[0.10] blur-[100px]"
        />
        <div className="animate-aurora absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-marketing-cyan/[0.06] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroBadge>Built for Twilio SEs</HeroBadge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8"
          >
            <GradientHeading as="h1" gradient="default" animated>
              Build Segment demos in minutes, not hours
            </GradientHeading>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Describe your next Segment demo in plain English, or step through the guided wizard — AI handles the architecture, code, and demo script. Your on-demand Segment Copilot is always one click away.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {/* Primary CTA with shimmer */}
            <div className="group relative">
              <div className="animate-glow-pulse absolute -inset-0.5 rounded-xl bg-gradient-to-r from-marketing-blue to-marketing-purple opacity-60 blur-sm" />
              <Button
                size="lg"
                render={<Link href="/sign-in" />}
                onClick={() =>
                  trackEvent("CTA Clicked", {
                    cta: "Get Started Free",
                    location: "hero",
                  })
                }
                className="relative bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </span>
                {/* Shimmer sweep */}
                <span className="animate-shimmer-sweep pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Button>
            </div>
            <Button size="lg" variant="outline" render={<Link href="/how-it-works" />} onClick={() => trackEvent("CTA Clicked", { cta: "See How It Works", location: "hero" })} className="border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 backdrop-blur-sm">
              <Play className="mr-2 h-4 w-4" />
              See How It Works
            </Button>
          </motion.div>
        </div>

        {/* Product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-20 max-w-5xl"
        >
          {/* Glow halo behind mockup */}
          <div className="animate-glow-pulse pointer-events-none absolute left-1/2 -translate-x-1/2 h-40 w-3/4 rounded-full bg-marketing-blue/20 blur-3xl" />

          {/* Outer glass frame */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.10] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-[1px] shadow-[0_0_80px_rgba(0,0,0,0.6)]">
            {/* Animated gradient border top edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marketing-blue/60 to-transparent" />

            <div className="overflow-hidden rounded-2xl bg-[#080810]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.05] bg-white/[0.02] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-white/[0.08]" />
                  <div className="h-3 w-3 rounded-full bg-white/[0.08]" />
                  <div className="h-3 w-3 rounded-full bg-white/[0.08]" />
                </div>
                <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground/60">
                  <div className="h-1.5 w-1.5 rounded-full bg-marketing-green/60" />
                  app.demobuilder.io
                </div>
              </div>

              {/* Fake app UI */}
              <div className="relative grid grid-cols-12 gap-4 p-6 overflow-hidden">
                {/* Scan line */}
                <div className="animate-scan-line pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-marketing-blue/40 to-transparent" />

                <div className="col-span-3 space-y-2.5">
                  <div className="mb-4 h-2 w-20 rounded bg-white/[0.08]" />
                  <div className="h-7 w-full rounded-md bg-marketing-blue/[0.15] border border-marketing-blue/20" />
                  <div className="h-7 w-full rounded-md bg-white/[0.04]" />
                  <div className="h-7 w-full rounded-md bg-white/[0.04]" />
                  <div className="mt-3 h-px w-full bg-white/[0.05]" />
                  <div className="h-7 w-full rounded-md bg-white/[0.04]" />
                  <div className="h-7 w-full rounded-md bg-white/[0.04]" />
                </div>

                <div className="col-span-9 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-marketing-blue/40 to-marketing-purple/40 border border-white/[0.08]" />
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-36 rounded bg-white/[0.10]" />
                        <div className="h-2 w-20 rounded bg-white/[0.04]" />
                      </div>
                    </div>
                    <div className="h-7 w-24 rounded-lg bg-gradient-to-r from-marketing-blue/30 to-marketing-purple/30 border border-white/[0.08]" />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { color: "marketing-blue", w: "w-10" },
                      { color: "marketing-purple", w: "w-14" },
                      { color: "marketing-cyan", w: "w-8" },
                      { color: "marketing-green", w: "w-12" },
                    ].map((item, i) => (
                      <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-2">
                        <div className={`h-1.5 ${item.w} rounded bg-${item.color}/30`} />
                        <div className="h-4 w-full rounded bg-white/[0.06]" />
                        <div className="h-1.5 w-3/4 rounded bg-white/[0.04]" />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-marketing-green/70" />
                      <div className="h-2 w-24 rounded bg-white/[0.08]" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-white/[0.05]" />
                      <div className="h-2 w-5/6 rounded bg-white/[0.05]" />
                      <div className="h-2 w-4/6 rounded bg-white/[0.05]" />
                      <div className="h-2 w-3/6 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection gradient */}
          <div className="pointer-events-none mt-px h-24 w-full rounded-b-2xl bg-gradient-to-b from-white/[0.04] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
