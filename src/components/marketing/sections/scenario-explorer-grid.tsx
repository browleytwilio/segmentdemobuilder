"use client";

import { ScenarioExplorerCard } from "./scenario-explorer-card";

interface Scenario {
  name: string;
  description: string;
}

export function ScenarioExplorerGrid({
  scenarios,
}: {
  scenarios: Scenario[];
}) {
  return (
    <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
      {scenarios.map((s, i) => (
        <ScenarioExplorerCard
          key={s.name}
          name={s.name}
          description={s.description}
          index={i}
        />
      ))}
    </div>
  );
}
