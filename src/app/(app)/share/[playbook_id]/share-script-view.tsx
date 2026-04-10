"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PlaybookRow } from "@/lib/compiler/types";
import { generateDemoScript } from "@/lib/compiler/demo-script";
import { downloadMarkdown } from "@/lib/export/download";
import { clonePlaybook } from "@/app/(app)/dashboard/actions";
import { DemoScriptView } from "@/components/playbook/demo-script-view";
import { Button } from "@/components/ui/button";
import { CopyIcon, DownloadIcon, Loader2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/events";

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

  const router = useRouter();
  const [forking, setForking] = useState(false);

  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("Shared Playbook Viewed", {
      playbook_id: playbook.id,
      industry: playbook.industry,
    });
  }, [playbook.id, playbook.industry]);

  function handleDownload() {
    trackEvent("Shared Demo Script Downloaded", { playbook_id: playbook.id });
    downloadMarkdown(`${playbook.customer_name}-demo-script.md`, script);
  }

  async function handleFork() {
    setForking(true);
    const result = await clonePlaybook(playbook.id);
    if (result.error) {
      toast.error(result.error);
    } else if (result.id) {
      trackEvent("Shared Playbook Forked", {
        source_playbook_id: playbook.id,
        new_playbook_id: result.id,
      });
      toast.success("Playbook forked to your library");
      router.push(`/playbooks/${result.id}`);
    }
    setForking(false);
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
        <div className="flex gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFork}
            disabled={forking}
          >
            {forking ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            Fork to My Library
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <DownloadIcon className="size-3.5" />
            Download .md
          </Button>
        </div>
      </div>

      <DemoScriptView markdown={script} />
    </div>
  );
}
