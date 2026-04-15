"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBuilderStore } from "@/lib/stores/builder-store";
import {
  architectureSchema,
  type ArchitectureFormData,
} from "@/lib/validations/builderSchemas";
import { DATABASE_PROVIDERS, AUTH_PROVIDERS } from "@/lib/compiler/providers";
import type { DatabaseProvider, AuthProvider } from "@/lib/compiler/providers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics/events";

interface StepArchitectureProps {
  onNext: () => void;
  onBack: () => void;
}

const TOGGLES: {
  name: "enableSESidebar" | "enableSeededProfiles" | "enableProfileAPI" | "enableIntentPredictions";
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

const DB_OPTIONS = Object.values(DATABASE_PROVIDERS) as {
  id: DatabaseProvider;
  label: string;
  description: string;
}[];

const AUTH_OPTIONS = Object.values(AUTH_PROVIDERS) as {
  id: AuthProvider;
  label: string;
  description: string;
}[];

export function StepArchitecture({ onNext, onBack }: StepArchitectureProps) {
  const { architecture, databaseProvider, authProvider, updateArchitecture, updateProviders } =
    useBuilderStore();

  const { control, handleSubmit } = useForm<ArchitectureFormData>({
    resolver: zodResolver(architectureSchema),
    defaultValues: {
      enableSESidebar: architecture.enableSESidebar,
      enableSeededProfiles: architecture.enableSeededProfiles,
      enableProfileAPI: architecture.enableProfileAPI,
      enableIntentPredictions: architecture.enableIntentPredictions,
      enableSecondPagePers: architecture.enableSecondPagePers,
      databaseProvider,
      authProvider,
    },
  });

  function onValid(data: ArchitectureFormData) {
    trackEvent("Wizard Step Submitted", {
      step: 2,
      enable_se_sidebar: data.enableSESidebar,
      enable_seeded_profiles: data.enableSeededProfiles,
      enable_profile_api: data.enableProfileAPI,
      enable_intent_predictions: data.enableIntentPredictions,
      database_provider: data.databaseProvider,
      auth_provider: data.authProvider,
    });
    updateArchitecture({
      enableSESidebar: data.enableSESidebar,
      enableSeededProfiles: data.enableSeededProfiles,
      enableProfileAPI: data.enableProfileAPI,
      enableIntentPredictions: data.enableIntentPredictions,
    });
    updateProviders({
      databaseProvider: data.databaseProvider as DatabaseProvider,
      authProvider: data.authProvider as AuthProvider,
    });
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Core Demo Architecture</h2>
        <p className="text-sm text-muted-foreground">
          Configure the infrastructure and Segment capabilities for this demo.
        </p>
      </div>

      {/* Infrastructure Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Infrastructure
        </h3>

        <Controller
          name="databaseProvider"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Database Provider</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select database..." />
                </SelectTrigger>
                <SelectContent>
                  {DB_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      <span className="font-medium">{opt.label}</span>
                      <span className="ml-2 text-muted-foreground text-xs">
                        {opt.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <Controller
          name="authProvider"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Auth Provider</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select auth..." />
                </SelectTrigger>
                <SelectContent>
                  {AUTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      <span className="font-medium">{opt.label}</span>
                      <span className="ml-2 text-muted-foreground text-xs">
                        {opt.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      {/* Segment Feature Toggles */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Segment Features
        </h3>

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
                  checked={field.value as boolean}
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
