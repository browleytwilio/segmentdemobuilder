"use client";

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
    <div className={cn("text-center", className)}>
      <div className="text-4xl font-bold text-foreground lg:text-5xl">
        <AnimatedCounter target={value} suffix={suffix} prefix={prefix} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
