"use client";

import type { CompiledPrompt } from "@/lib/compiler/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepStepperProps {
  prompts: CompiledPrompt[];
  activeStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export function StepStepper({
  prompts,
  activeStep,
  completedSteps,
  onStepClick,
}: StepStepperProps) {
  const progressPercent =
    prompts.length > 0
      ? Math.round((completedSteps.length / prompts.length) * 100)
      : 0;

  return (
    <nav
      className="sticky top-10 space-y-4 print:hidden"
      data-print-hide
      aria-label="Playbook progress"
    >
      <Progress value={progressPercent}>
        <span className="text-xs text-muted-foreground">
          {completedSteps.length} / {prompts.length} steps
        </span>
      </Progress>

      <div className="space-y-1">
        {prompts.map((prompt) => {
          const isComplete = completedSteps.includes(prompt.stepNumber);
          const isActive = prompt.stepNumber === activeStep;

          return (
            <button
              key={prompt.stepNumber}
              onClick={() => onStepClick(prompt.stepNumber)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isActive && "bg-primary/10 text-primary font-medium",
                !isActive && "hover:bg-muted text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                  isComplete &&
                    "border-green-500 bg-green-500 text-white",
                  isActive &&
                    !isComplete &&
                    "border-primary text-primary",
                  !isActive &&
                    !isComplete &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  prompt.stepNumber
                )}
              </div>
              <span className="truncate">{prompt.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
