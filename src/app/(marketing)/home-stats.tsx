"use client";

import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { StatCounter } from "@/components/marketing/sections/stat-counter";

const stats = [
  { value: 15, suffix: "min", label: "Average playbook creation time" },
  { value: 74, suffix: "%", label: "Reduction in demo prep time" },
  { value: 500, suffix: "+", label: "Playbooks generated" },
  { value: 34, suffix: "%", label: "Demo-to-POC conversion rate" },
];

export function HomeStats() {
  return (
    <SectionWrapper background="muted">
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
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
