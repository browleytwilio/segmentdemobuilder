"use client";

import { motion } from "framer-motion";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border p-8",
        popular
          ? "border-marketing-blue/40 bg-white/[0.06]"
          : "border-white/[0.08] bg-white/[0.03]"
      )}
    >
      {popular && (
        <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-marketing-blue to-marketing-purple px-12 py-1 text-xs font-medium text-white">
          Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">{price}</span>
        {period && price !== "Custom" && (
          <span className="text-sm text-muted-foreground">{period}</span>
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
      <Button
        render={<Link href={href} />}
        variant={popular ? "default" : "outline"}
        className={cn(
          "w-full",
          popular && "bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-90"
        )}
      >
        {cta}
      </Button>
    </motion.div>
  );
}
