"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
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
  const Icon =
    (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] ??
    LucideIcons.Sparkles;

  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.18]",
        className
      )}
    >
      {/* Mouse-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(320px circle at ${spotlight.x}px ${spotlight.y}px, rgba(99,102,241,0.09), transparent 65%)`,
        }}
      />

      {/* Corner glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-marketing-blue/[0.08] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top shimmer edge */}
      <div className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-marketing-blue/50 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative">
        <div className="mb-4 inline-flex rounded-xl border border-white/[0.10] bg-white/[0.04] p-2.5 transition-all duration-300 group-hover:border-marketing-blue/20 group-hover:bg-marketing-blue/[0.08]">
          <Icon className="h-5 w-5 text-marketing-blue transition-transform duration-300 group-hover:scale-110" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
