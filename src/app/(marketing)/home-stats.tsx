"use client";

import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { StatCounter } from "@/components/marketing/sections/stat-counter";

const stats = [
  { value: 5, suffix: "min", label: "Time from wizard to generated playbook" },
  { value: 2, suffix: "", label: "Ways to build — wizard or plain English" },
  { value: 4, suffix: "", label: "Industries supported out of the box" },
  { value: 0, suffix: "", label: "Credentials ever stored to database" },
];

export function HomeStats() {
  return (
    <SectionWrapper background="muted">
      <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCounter
            key={stat.label}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
