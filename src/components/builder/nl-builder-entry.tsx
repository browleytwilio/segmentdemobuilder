"use client";

import { useState } from "react";
import { useBuilderStore } from "@/lib/stores/builder-store";
import { getDemoFeaturesForWizard } from "@/app/(app)/builder/actions";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SparklesIcon, LoaderIcon, ArrowRightIcon } from "lucide-react";

export function NLBuilderEntry({ onSwitchToWizard }: { onSwitchToWizard: () => void }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateContext, updateArchitecture, updateProviders, setStep } = useBuilderStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error("Failed to parse description");
      const data = await res.json();

      trackEvent("NL Builder Used", { description_length: description.length });

      updateContext({
        customerName: data.customerName || "",
        industry: data.industry || "",
        persona: data.persona || "",
      });
      updateArchitecture(data.architecture || {});
      updateProviders({
        databaseProvider: data.databaseProvider || "supabase",
        authProvider: data.authProvider || "none",
      });

      // Pre-select scenarios suggested by the AI
      if (data.suggestedScenarios?.length && data.industry) {
        const { data: features } = await getDemoFeaturesForWizard(data.industry);
        if (features) {
          const matchedIds = features
            .filter((f: { slug: string }) => data.suggestedScenarios.includes(f.slug))
            .map((f: { id: string }) => f.id);
          if (matchedIds.length > 0) {
            updateContext({ selectedScenarios: matchedIds });
          }
        }
      }

      // Switch to wizard at step 3 (scenarios) with context pre-filled
      setStep(2);
      onSwitchToWizard();
    } catch {
      setError("Could not parse your description. Try being more specific about the industry and persona.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="space-y-1.5 text-center">
        <div className="flex items-center justify-center gap-2">
          <SparklesIcon className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Describe Your Demo</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Tell us what you need in plain language and AI will configure your
          playbook.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nl-description">Demo description</Label>
        <textarea
          id="nl-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., I need a fintech demo for a CTO focused on PII compliance and risk scoring. The customer is Acme Bank."
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSwitchToWizard}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Use step-by-step wizard instead
        </button>
        <Button type="submit" disabled={!description.trim() || loading} className="gap-2">
          {loading ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : (
            <ArrowRightIcon className="size-4" />
          )}
          Configure Playbook
        </Button>
      </div>
    </form>
  );
}
