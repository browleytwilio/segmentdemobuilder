"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
  index?: number;
}

export function PricingCard({
  name,
  price,
  period = "/month",
  description,
  features,
  cta,
  href,
  popular = false,
  index = 0,
}: PricingCardProps) {
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative"
    >
      {/* Popular glow halo */}
      {popular && (
        <div className="animate-glow-pulse pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-marketing-blue/40 via-marketing-purple/20 to-transparent blur-sm" />
      )}

      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-2xl border p-8 transition-all duration-300",
          popular
            ? "border-marketing-blue/30 bg-gradient-to-b from-marketing-blue/[0.08] to-white/[0.03]"
            : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]"
        )}
      >
        {/* Mouse spotlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(300px circle at ${spotlight.x}px ${spotlight.y}px, ${popular ? "rgba(99,102,241,0.10)" : "rgba(99,102,241,0.06)"}, transparent 65%)`,
          }}
        />

        {/* Top edge shimmer */}
        {popular && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marketing-blue/70 to-transparent" />
        )}

        {popular && (
          <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-marketing-blue/20 bg-marketing-blue/10 px-3 py-1 text-xs font-medium text-marketing-blue">
            <span className="h-1.5 w-1.5 rounded-full bg-marketing-blue" />
            Most Popular
          </div>
        )}

        <div className="relative mb-6">
          <h3 className="mb-1.5 text-lg font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="relative mb-6">
          <span
            className={cn(
              "text-4xl font-bold",
              popular
                ? "bg-gradient-to-r from-marketing-blue to-marketing-purple bg-clip-text text-transparent"
                : "text-foreground"
            )}
          >
            {price}
          </span>
          {period && price !== "Custom" && (
            <span className="ml-1 text-sm text-muted-foreground">{period}</span>
          )}
        </div>

        <ul className="mb-8 flex-1 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-marketing-green" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="relative">
          {popular && (
            <div className="animate-glow-pulse absolute -inset-0.5 rounded-xl bg-gradient-to-r from-marketing-blue to-marketing-purple opacity-50 blur-sm" />
          )}
          <Button
            render={<Link href={href} />}
            variant={popular ? "default" : "outline"}
            className={cn(
              "relative w-full overflow-hidden",
              popular &&
                "bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-95"
            )}
          >
            {popular && (
              <span className="animate-shimmer-sweep pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            <span className="relative z-10">{cta}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
