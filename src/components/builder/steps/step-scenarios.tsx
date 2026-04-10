"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBuilderStore } from "@/lib/stores/builder-store";
import {
  scenariosSchema,
  type ScenariosFormData,
} from "@/lib/validations/builderSchemas";
import { getDemoFeaturesForWizard } from "@/app/builder/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DemoFeature {
  id: string;
  slug: string;
  label: string;
  description: string;
}

interface StepScenariosProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepScenarios({ onNext, onBack }: StepScenariosProps) {
  const { industry, selectedScenarios, updateContext, updateArchitecture } =
    useBuilderStore();

  const [features, setFeatures] = useState<DemoFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!industry) {
      setFeatures([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    startTransition(async () => {
      const { data } = await getDemoFeaturesForWizard(industry);
      setFeatures(data ?? []);
      setLoading(false);
    });
  }, [industry]);

  const { control, handleSubmit } = useForm<ScenariosFormData>({
    resolver: zodResolver(scenariosSchema),
    defaultValues: {
      selectedScenarios: selectedScenarios || [],
    },
  });

  function onValid(data: ScenariosFormData) {
    updateContext({ selectedScenarios: data.selectedScenarios });
    // Auto-enable second-page personalization if that scenario's feature is selected
    const selectedSlugs = data.selectedScenarios
      .map((id) => features.find((f) => f.id === id)?.slug)
      .filter(Boolean);
    updateArchitecture({
      enableSecondPagePers: selectedSlugs.includes(
        "second-page-personalization"
      ),
    });
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Personalization Scenarios</h2>
        <p className="text-sm text-muted-foreground">
          Select the scenarios to include in your{" "}
          <span className="font-medium">{industry || "selected industry"}</span>{" "}
          demo.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      ) : features.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No scenarios available. Go back and select an industry first.
        </p>
      ) : (
        <Controller
          name="selectedScenarios"
          control={control}
          render={({ field }) => (
            <div className="space-y-3">
              {features.map((feature) => {
                const isChecked = field.value.includes(feature.id);
                return (
                  <label
                    key={feature.id}
                    className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...field.value, feature.id]
                          : field.value.filter((v) => v !== feature.id);
                        field.onChange(next);
                      }}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">
                        {feature.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        />
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          Next
        </Button>
      </div>
    </form>
  );
}
