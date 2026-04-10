"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/marketing/animations/animated-counter";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  className?: string;
}

export function StatCounter({
  value,
  suffix,
  prefix,
  label,
  className,
}: StatCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className={cn("group relative text-center", className)}
    >
      {/* Subtle glow behind number */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-blue/[0.08] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative bg-gradient-to-r from-marketing-blue via-white to-marketing-purple bg-clip-text text-4xl font-bold text-transparent lg:text-5xl animate-gradient-shift">
        <AnimatedCounter target={value} suffix={suffix} prefix={prefix} />
      </div>

      {/* Divider */}
      <div className="mx-auto mt-3 mb-2 h-px w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}
