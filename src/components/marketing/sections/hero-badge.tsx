"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroBadge({ children, className }: HeroBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("relative inline-flex", className)}
    >
      {/* Outer glow */}
      <div className="animate-glow-pulse absolute -inset-px rounded-full bg-gradient-to-r from-marketing-blue/30 via-marketing-purple/20 to-marketing-cyan/20 blur-sm" />

      {/* Badge */}
      <div className="relative overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-1.5 backdrop-blur-md">
        {/* Shimmer sweep */}
        <div className="animate-shimmer-sweep pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        <div className="relative flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-marketing-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-marketing-green" />
          </span>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
