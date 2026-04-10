"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { PlaybookRow } from "@/lib/compiler/types";
import { generateDemoScript } from "@/lib/compiler/demo-script";
import { downloadMarkdown } from "@/lib/export/download";
import { useClipboard } from "@/hooks/use-clipboard";
import { usePlaybookProgress } from "@/hooks/use-playbook-progress";
import dynamic from "next/dynamic";
import {
  RehydrationModal,
  needsRehydration,
  rehydratePrompts,
} from "./rehydration-modal";
import { StepStepper } from "./step-stepper";
import { PromptCard } from "./prompt-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DemoScriptView = dynamic(
  () => import("./demo-script-view").then((m) => m.DemoScriptView),
  { ssr: false }
);
const AIScriptGenerator = dynamic(
  () => import("./ai-script-generator").then((m) => m.AIScriptGenerator),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  PrinterIcon,
  ShareIcon,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

interface PlaybookViewerProps {
  playbook: PlaybookRow;
}

export function PlaybookViewer({ playbook }: PlaybookViewerProps) {
  const [prompts, setPrompts] = useState(playbook.generated_prompts);
  const [showRehydration, setShowRehydration] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const { completedSteps, markComplete, isComplete } = usePlaybookProgress(
    playbook.id
  );
  const { copy } = useClipboard();

  // Check if rehydration is needed on mount
  const requiresRehydration = needsRehydration(playbook.generated_prompts);
  useEffect(() => {
    trackEvent("Playbook Viewed", {
      playbook_id: playbook.id,
      industry: playbook.industry,
      status: playbook.status,
      prompt_count: playbook.generated_prompts.length,
      needs_rehydration: requiresRehydration,
    });
    if (requiresRehydration) {
      setShowRehydration(true);
    }
  }, [playbook, requiresRehydration]);

  // Auto-scroll to first incomplete step on mount
  useEffect(() => {
    if (prompts.length === 0) return;
    const firstIncomplete = prompts.find(
      (p) => !completedSteps.includes(p.stepNumber)
    );
    if (firstIncomplete) {
      setActiveStep(firstIncomplete.stepNumber);
      setTimeout(() => {
        document
          .getElementById(`step-${firstIncomplete.stepNumber}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRehydrate = useCallback(
    (keys: Record<string, string>) => {
      try {
        const rehydrated = rehydratePrompts(
          playbook.generated_prompts,
          keys as Parameters<typeof rehydratePrompts>[1]
        );
        setPrompts(rehydrated);
        setShowRehydration(false);
        toast.success("Keys injected — prompts are ready to use");
      } catch {
        toast.error("Failed to inject keys. Check your credentials and try again.");
      }
    },
    [playbook.generated_prompts]
  );

  const handleDismissRehydration = useCallback(() => {
    setShowRehydration(false);
  }, []);

  const handleMarkComplete = useCallback(
    (step: number) => {
      markComplete(step);
      // Auto-advance to next step
      const next = prompts.find(
        (p) => p.stepNumber > step && !completedSteps.includes(p.stepNumber)
      );
      if (next) {
        setActiveStep(next.stepNumber);
        setTimeout(() => {
          document
            .getElementById(`step-${next.stepNumber}`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    },
    [markComplete, prompts, completedSteps]
  );

  // Generate the SE Demo Script from demo_config
  const demoScript = generateDemoScript({
    customerName: playbook.customer_name,
    persona: playbook.demo_config.persona,
    industry: playbook.industry,
    selectedScenarios: playbook.demo_config.selectedScenarios,
    architecture: playbook.demo_config.architecture,
    scenarioSlugs: playbook.demo_config.scenarioSlugs,
  });

  function handleExportPrompts() {
    trackEvent("Prompts Exported", { playbook_id: playbook.id, format: "markdown" });
    const content = prompts
      .map(
        (p) =>
          `# Step ${p.stepNumber}: ${p.title}\n\n${p.promptText}\n\n---\n`
      )
      .join("\n");
    downloadMarkdown(
      `${playbook.customer_name}-build-prompts.md`,
      content
    );
  }

  function handleExportScript() {
    trackEvent("Demo Script Exported", { playbook_id: playbook.id, format: "markdown" });
    downloadMarkdown(
      `${playbook.customer_name}-demo-script.md`,
      demoScript
    );
  }

  function handlePrint() {
    trackEvent("Print Triggered", { playbook_id: playbook.id });
    window.print();
  }

  function handleShare() {
    const url = `${window.location.origin}/share/${playbook.id}`;
    copy(url);
    trackEvent("Share Link Copied", { playbook_id: playbook.id });
    toast.success("Share link copied to clipboard");
  }

  return (
    <>
      <RehydrationModal
        open={showRehydration}
        onSubmit={handleRehydrate}
        onDismiss={handleDismissRehydration}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {playbook.customer_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {playbook.industry} Playbook
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <ShareIcon className="size-3.5" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <PrinterIcon className="size-3.5" />
              PDF
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prompts" onValueChange={(tab) => {
          if (tab) trackEvent("Tab Switched", { playbook_id: playbook.id, tab: tab as "prompts" | "script" });
        }}>
          <div className="flex items-center justify-between gap-4 print:hidden">
            <TabsList>
              <TabsTrigger value="prompts">Build Prompts</TabsTrigger>
              <TabsTrigger value="script">SE Demo Script</TabsTrigger>
            </TabsList>
          </div>

          {/* Build Prompts Tab */}
          <TabsContent value="prompts">
            <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
              {/* Left: Stepper */}
              <div className="hidden lg:block">
                <StepStepper
                  prompts={prompts}
                  activeStep={activeStep}
                  completedSteps={completedSteps}
                  onStepClick={(step) => {
                    trackEvent("Step Clicked", { playbook_id: playbook.id, step_number: step });
                    setActiveStep(step);
                    document
                      .getElementById(`step-${step}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              </div>

              {/* Right: Prompt Cards */}
              <div className="space-y-6">
                {prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.stepNumber}
                    prompt={prompt}
                    playbookId={playbook.id}
                    isComplete={isComplete(prompt.stepNumber)}
                    onMarkComplete={() =>
                      handleMarkComplete(prompt.stepNumber)
                    }
                  />
                ))}

                <div className="print:hidden">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleExportPrompts}
                  >
                    <DownloadIcon className="size-4" />
                    Export Prompts as Markdown
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SE Demo Script Tab */}
          <TabsContent value="script">
            <div className="mt-6 space-y-6">
              <AIScriptGenerator playbook={playbook} />
              <div className="relative">
                <div className="absolute inset-x-0 top-0 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span>Static Script</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="pt-6">
                  <DemoScriptView markdown={demoScript} />
                </div>
              </div>
              <div className="print:hidden">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportScript}
                >
                  <DownloadIcon className="size-4" />
                  Export Static Script as Markdown
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
