"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CodeBlockDisplayProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlockDisplay({
  code,
  language = "typescript",
  title,
  className,
}: CodeBlockDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        "overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0a]",
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">{title}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4">
        <code className="text-sm leading-relaxed text-foreground/80 font-mono">
          {code}
        </code>
      </pre>
    </motion.div>
  );
}
