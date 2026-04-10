"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { PlaybookRow } from "@/lib/compiler/types";
import { generateDemoScript } from "@/lib/compiler/demo-script";
import { downloadMarkdown } from "@/lib/export/download";
import { useClipboard } from "@/hooks/use-clipboard";
import { usePlaybookProgress } from "@/hooks/use-playbook-progress";
import {
  RehydrationModal,
  needsRehydration,
  rehydratePrompts,
} from "./rehydration-modal";
import { StepStepper } from "./step-stepper";
import { PromptCard } from "./prompt-card";
import { DemoScriptView } from "./demo-script-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  PrinterIcon,
  ShareIcon,
} from "lucide-react";

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
  useEffect(() => {
    if (needsRehydration(playbook.generated_prompts)) {
      setShowRehydration(true);
    }
  }, [playbook.generated_prompts]);

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
      const rehydrated = rehydratePrompts(
        playbook.generated_prompts,
        keys as Parameters<typeof rehydratePrompts>[1]
      );
      setPrompts(rehydrated);
      setShowRehydration(false);
      toast.success("Keys injected — prompts are ready to use");
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
    downloadMarkdown(
      `${playbook.customer_name}-demo-script.md`,
      demoScript
    );
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const url = `${window.location.origin}/share/${playbook.id}`;
    copy(url);
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
          <div className="flex gap-2 print:hidden" data-print-hide>
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
        <Tabs defaultValue="prompts">
          <div className="flex items-center justify-between gap-4 print:hidden" data-print-hide>
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
                    isComplete={isComplete(prompt.stepNumber)}
                    onMarkComplete={() =>
                      handleMarkComplete(prompt.stepNumber)
                    }
                  />
                ))}

                <div className="print:hidden" data-print-hide>
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
              <DemoScriptView markdown={demoScript} />
              <div className="print:hidden" data-print-hide>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportScript}
                >
                  <DownloadIcon className="size-4" />
                  Export Demo Script as Markdown
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
