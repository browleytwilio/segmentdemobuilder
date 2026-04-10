"use client";

import { cn } from "@/lib/utils";

interface LogoCloudProps {
  logos: { name: string; className?: string }[];
  className?: string;
}

export function LogoCloud({ logos, className }: LogoCloudProps) {
  return (
    <div className={cn("relative overflow-hidden py-8", className)}>
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex animate-marquee items-center gap-16">
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex shrink-0 items-center text-lg font-semibold text-white/30 transition-colors hover:text-white/50"
          >
            {logo.name}
          </div>
        ))}
      </div>
    </div>
  );
}
