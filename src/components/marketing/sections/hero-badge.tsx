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
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-marketing-green opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-marketing-green" />
      </span>
      {children}
    </motion.div>
  );
}
