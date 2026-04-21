"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useBuilderStore } from "@/lib/stores/builder-store";
import { useBuilderWizard, STEP_LABELS } from "@/lib/builder/use-builder-wizard";
import {
  wizardVariants,
  wizardTransition,
} from "@/lib/builder/animation-variants";
import {
  createPlaybook,
  getDemoFeaturesForWizard,
} from "@/app/(app)/builder/actions";
import { StepContext } from "./steps/step-context";
import { StepArchitecture } from "./steps/step-architecture";
import { StepScenarios } from "./steps/step-scenarios";
import { StepCredentials } from "./steps/step-credentials";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";

export function BuilderWizard() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Wait for Zustand persist rehydration before rendering forms
  useEffect(() => {
    const unsub = useBuilderStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (e.g. no persisted state), set immediately
    if (useBuilderStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  // Track wizard started once after hydration
  useEffect(() => {
    if (!hydrated) return;
    const hasPersistedState = !!(customerName || industry || persona);
    trackEvent("Wizard Started", { has_persisted_state: hasPersistedState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const { currentStep, direction, goNext, goBack } = useBuilderWizard();

  const {
    customerName,
    industry,
    persona,
    architecture,
    selectedScenarios,
    databaseProvider,
    authProvider,
    productName,
    tagline,
    primaryColor,
    accentColor,
    voiceTone,
  } = useBuilderStore();

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    // Build scenarioSlugs map: { featureId → slug }
    const featuresResult = await getDemoFeaturesForWizard(industry);
    if (!featuresResult.data) {
      trackEvent("Playbook Creation Failed", { error: "Failed to load features" });
      setSubmitError("Failed to load scenario features. Please try again.");
      setIsSubmitting(false);
      return;
    }
    const scenarioSlugs: Record<string, string> = {};
    for (const f of featuresResult.data) {
      if (selectedScenarios.includes(f.id)) {
        scenarioSlugs[f.id] = f.slug;
      }
    }

    const result = await createPlaybook({
      customer_name: customerName,
      industry,
      demo_config: {
        persona,
        architecture,
        selectedScenarios,
        scenarioSlugs,
        databaseProvider,
        authProvider,
        productName,
        tagline,
        primaryColor,
        accentColor,
        voiceTone,
      },
    });

    if (result.error) {
      trackEvent("Playbook Creation Failed", { error: result.error });
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    trackEvent("Playbook Created", { playbook_id: result.id! });
    router.push(`/builder/compile/${result.id}`);
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <nav aria-label="Wizard progress" className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  i < currentStep &&
                    "border-primary bg-primary text-primary-foreground",
                  i === currentStep &&
                    "border-primary bg-primary/10 text-primary",
                  i > currentStep && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  i === currentStep
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  i < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Step content with directional transitions */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={wizardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={wizardTransition}
          >
            {currentStep === 0 && <StepContext onNext={goNext} />}
            {currentStep === 1 && (
              <StepArchitecture onNext={goNext} onBack={goBack} />
            )}
            {currentStep === 2 && (
              <StepScenarios onNext={goNext} onBack={goBack} />
            )}
            {currentStep === 3 && (
              <StepCredentials
                onBack={goBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {submitError && (
        <p className="text-sm text-destructive text-center">{submitError}</p>
      )}
    </div>
  );
}
