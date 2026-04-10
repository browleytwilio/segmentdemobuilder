"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBuilderStore } from "@/lib/stores/builder-store";
import {
  architectureSchema,
  type ArchitectureFormData,
} from "@/lib/validations/builderSchemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface StepArchitectureProps {
  onNext: () => void;
  onBack: () => void;
}

const TOGGLES: {
  name: keyof ArchitectureFormData;
  label: string;
  description: string;
}[] = [
  {
    name: "enableSESidebar",
    label: "Source Engine Sidebar",
    description: "Embeddable sidebar showing real-time Segment event stream",
  },
  {
    name: "enableSeededProfiles",
    label: "Seeded Profiles",
    description: "Pre-populate Unify profiles with realistic demo data",
  },
  {
    name: "enableProfileAPI",
    label: "Profile API",
    description: "Enable real-time trait lookups via the Segment Profile API",
  },
  {
    name: "enableIntentPredictions",
    label: "Intent Predictions",
    description: "Use Segment Predictions to drive in-demo personalization",
  },
];

export function StepArchitecture({ onNext, onBack }: StepArchitectureProps) {
  const { architecture, updateArchitecture } = useBuilderStore();

  const { control, handleSubmit } = useForm<ArchitectureFormData>({
    resolver: zodResolver(architectureSchema),
    defaultValues: {
      enableSESidebar: architecture.enableSESidebar,
      enableSeededProfiles: architecture.enableSeededProfiles,
      enableProfileAPI: architecture.enableProfileAPI,
      enableIntentPredictions: architecture.enableIntentPredictions,
    },
  });

  function onValid(data: ArchitectureFormData) {
    updateArchitecture(data);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Core Demo Architecture</h2>
        <p className="text-sm text-muted-foreground">
          Toggle the Segment capabilities this demo should showcase.
        </p>
      </div>

      <div className="space-y-4">
        {TOGGLES.map((toggle) => (
          <Controller
            key={toggle.name}
            name={toggle.name}
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{toggle.label}</Label>
                  <p className="text-xs text-muted-foreground">
                    {toggle.description}
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
