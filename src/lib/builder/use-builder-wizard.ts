"use client";

import { useState, useCallback, useRef } from "react";
import { useBuilderStore } from "@/lib/stores/builder-store";
import { trackEvent } from "@/lib/analytics/events";

const TOTAL_STEPS = 4;

export const STEP_LABELS = ["Context", "Architecture", "Scenarios", "Credentials"] as const;

export function useBuilderWizard() {
  const storeStep = useBuilderStore((s) => s.currentStep);
  const setStoreStep = useBuilderStore((s) => s.setStep);

  const [currentStep, setCurrentStep] = useState(storeStep);
  const [direction, setDirection] = useState(0);
  const stepEnteredAt = useRef(Date.now());

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      const timeOnStep = Date.now() - stepEnteredAt.current;
      setDirection(1);
      const next = currentStep + 1;
      trackEvent("Wizard Step Navigated", {
        from: currentStep,
        to: next,
        direction: "forward",
        time_on_step_ms: timeOnStep,
      });
      setCurrentStep(next);
      setStoreStep(next);
      stepEnteredAt.current = Date.now();
    }
  }, [currentStep, setStoreStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      const timeOnStep = Date.now() - stepEnteredAt.current;
      setDirection(-1);
      const prev = currentStep - 1;
      trackEvent("Wizard Step Navigated", {
        from: currentStep,
        to: prev,
        direction: "backward",
        time_on_step_ms: timeOnStep,
      });
      setCurrentStep(prev);
      setStoreStep(prev);
      stepEnteredAt.current = Date.now();
    }
  }, [currentStep, setStoreStep]);

  return {
    currentStep,
    direction,
    totalSteps: TOTAL_STEPS,
    isFirst: currentStep === 0,
    isLast: currentStep === TOTAL_STEPS - 1,
    goNext,
    goBack,
  };
}
