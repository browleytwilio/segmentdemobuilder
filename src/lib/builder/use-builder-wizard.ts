"use client";

import { useState, useCallback } from "react";
import { useBuilderStore } from "@/lib/stores/builder-store";

const TOTAL_STEPS = 4;

export const STEP_LABELS = ["Context", "Architecture", "Scenarios", "Credentials"] as const;

export function useBuilderWizard() {
  const storeStep = useBuilderStore((s) => s.currentStep);
  const setStoreStep = useBuilderStore((s) => s.setStep);

  const [currentStep, setCurrentStep] = useState(storeStep);
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      const next = currentStep + 1;
      setCurrentStep(next);
      setStoreStep(next);
    }
  }, [currentStep, setStoreStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setStoreStep(prev);
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
