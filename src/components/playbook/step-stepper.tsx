"use client";

import type { CompiledPrompt } from "@/lib/compiler/types";
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
      className="sticky top-20 space-y-4 print:hidden"
      data-print-hide
      aria-label="Playbook progress"
    >
      {/* Progress summary */}
      <div className="rounded-xl border bg-card p-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground tabular-nums">
            {completedSteps.length}/{prompts.length} steps
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 && (
          <p className="text-[0.65rem] font-medium text-emerald-600 dark:text-emerald-400">
            All steps completed
          </p>
        )}
      </div>

      {/* Steps list */}
      <div className="space-y-0.5">
        {prompts.map((prompt) => {
          const isComplete = completedSteps.includes(prompt.stepNumber);
          const isActive = prompt.stepNumber === activeStep;

          return (
            <button
              key={prompt.stepNumber}
              onClick={() => onStepClick(prompt.stepNumber)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all",
                isActive && "bg-primary/10 text-primary font-medium",
                isComplete && !isActive && "text-emerald-600 dark:text-emerald-400",
                !isActive && !isComplete && "hover:bg-muted text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  isComplete && "border-emerald-500 bg-emerald-500 text-white",
                  isActive && !isComplete && "border-primary bg-primary/10 text-primary",
                  !isActive && !isComplete && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  prompt.stepNumber
                )}
              </div>
              <span className="truncate text-[0.8rem]">{prompt.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
