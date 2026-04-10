"use client";

import type { PlaybookRow } from "@/lib/compiler/types";
import { generateDemoScript } from "@/lib/compiler/demo-script";
import { downloadMarkdown } from "@/lib/export/download";
import { DemoScriptView } from "@/components/playbook/demo-script-view";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

interface ShareScriptViewProps {
  playbook: Pick<
    PlaybookRow,
    "id" | "customer_name" | "industry" | "demo_config"
  >;
}

export function ShareScriptView({ playbook }: ShareScriptViewProps) {
  const script = generateDemoScript({
    customerName: playbook.customer_name,
    persona: playbook.demo_config.persona,
    industry: playbook.industry,
    selectedScenarios: playbook.demo_config.selectedScenarios,
    architecture: playbook.demo_config.architecture,
    scenarioSlugs: playbook.demo_config.scenarioSlugs,
  });

  function handleDownload() {
    downloadMarkdown(`${playbook.customer_name}-demo-script.md`, script);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{playbook.customer_name}</h1>
          <p className="text-sm text-muted-foreground">
            {playbook.industry} — SE Demo Script
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="print:hidden"
        >
          <DownloadIcon className="size-3.5" />
          Download .md
        </Button>
      </div>

      <DemoScriptView markdown={script} />
    </div>
  );
}
