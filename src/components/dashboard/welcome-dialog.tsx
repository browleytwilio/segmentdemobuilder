"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpenIcon, KeyIcon, SparklesIcon } from "lucide-react";

const STORAGE_KEY = "onboarding-dismissed";

interface WelcomeDialogProps {
  hasPlaybooks: boolean;
}

const steps = [
  {
    icon: BookOpenIcon,
    title: "Build Demo Playbooks",
    description:
      "Create step-by-step build prompts for AI coding agents that set up Segment CDP demos. Each playbook is customized for your prospect's industry, persona, and architecture.",
  },
  {
    icon: KeyIcon,
    title: "What You'll Need",
    description:
      "Have your Segment Write Key and Workspace API Token ready. You'll also need credentials for your database provider (Supabase, Neon, or Postgres). These are entered in the wizard and never stored.",
  },
  {
    icon: SparklesIcon,
    title: "Three Ways to Start",
    description:
      'Use the step-by-step Wizard for full control, "Describe with AI" to auto-configure from a plain-language description, or pick a Template for a quick start.',
  },
];

export function WelcomeDialog({ hasPlaybooks }: WelcomeDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (hasPlaybooks) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, [hasPlaybooks]);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  const current = steps[step];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleDismiss();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 mb-2">
            <current.icon className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{current.title}</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            {current.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-primary"
                  : i < step
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground"
          >
            Skip
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button size="sm" onClick={handleDismiss}>
                Get Started
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
