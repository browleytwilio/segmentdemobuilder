"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  className?: string;
  index?: number;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  index = 0,
}: FeatureCardProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] ?? LucideIcons.Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-white/[0.15] hover:bg-white/[0.05]",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-marketing-blue/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-2.5">
          <Icon className="h-5 w-5 text-marketing-blue" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
