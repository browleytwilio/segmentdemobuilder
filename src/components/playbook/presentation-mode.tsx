"use client";

import { useState, useEffect, useCallback } from "react";
import type { CompiledPrompt } from "@/lib/compiler/types";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  CodeIcon,
  EyeIcon,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

interface PresentationModeProps {
  prompts: CompiledPrompt[];
  playbookId: string;
  customerName: string;
  onClose: () => void;
}

export function PresentationMode({
  prompts,
  playbookId,
  customerName,
  onClose,
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);

  const prompt = prompts[currentIndex];
  const total = prompts.length;

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "c" || e.key === "C") {
        setShowCode((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    trackEvent("Step Clicked", { playbook_id: playbookId, step_number: prompt.stepNumber });
  }, [currentIndex, playbookId, prompt.stepNumber]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {customerName}
          </span>
          <span className="text-xs text-muted-foreground">
            Step {currentIndex + 1} of {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode((v) => !v)}
          >
            {showCode ? (
              <><EyeIcon className="size-4" /> Overview</>
            ) : (
              <><CodeIcon className="size-4" /> Show Code</>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="size-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-auto px-8 py-12">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {/* Step badge */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-lg font-bold text-primary">
              {prompt.stepNumber}
            </div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {prompt.title}
            </h1>
          </div>

          {/* Expected output */}
          <div className="rounded-xl border bg-muted/30 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Expected Output
            </h3>
            <p className="text-base leading-relaxed">{prompt.expectedOutput}</p>
          </div>

          {/* Code block (toggled) */}
          {showCode && (
            <pre className="max-h-[50vh] overflow-auto rounded-xl bg-zinc-950 p-6 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap dark:bg-zinc-900 border border-zinc-800">
              {prompt.promptText}
            </pre>
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <footer className="flex items-center justify-between border-t px-6 py-3">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="size-4" />
          Previous
        </Button>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5">
          {prompts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={goNext}
          disabled={currentIndex === total - 1}
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Button>
      </footer>
    </div>
  );
}
