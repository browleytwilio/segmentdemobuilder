"use client";

import { useState } from "react";
import type { DemoArchitecture } from "@/lib/stores/builder-store";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklesIcon, LoaderIcon } from "lucide-react";

interface Recommendation {
  scenarioSlug: string;
  reasoning: string;
  impactScore: number;
}

interface ScenarioRecommendationsProps {
  customerName: string;
  industry: string;
  persona: string;
  architecture: DemoArchitecture;
  features: { id: string; slug: string; label: string }[];
  selectedIds: string[];
  onToggle: (featureId: string, checked: boolean) => void;
}

export function ScenarioRecommendations({
  customerName,
  industry,
  persona,
  architecture,
  features,
  selectedIds,
  onToggle,
}: ScenarioRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function handleRecommend() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/recommend-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, industry, persona, architecture }),
      });
      if (!res.ok) throw new Error("Failed to get recommendations");
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);
      setSummary(data.summary ?? "");
      setHasLoaded(true);
      trackEvent("AI Scenarios Recommended", {
        industry,
        persona,
        count: data.recommendations?.length ?? 0,
      });
    } catch {
      setRecommendations([]);
      setSummary("Unable to generate recommendations. Please select manually.");
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  function handleApply(slug: string) {
    const feature = features.find((f) => f.slug === slug);
    if (feature && !selectedIds.includes(feature.id)) {
      onToggle(feature.id, true);
    }
  }

  function handleApplyAll() {
    for (const rec of recommendations) {
      handleApply(rec.scenarioSlug);
    }
  }

  if (!hasLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
        <SparklesIcon className="size-4 text-muted-foreground" />
        <span className="flex-1 text-xs text-muted-foreground">
          Get AI-powered scenario recommendations
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRecommend}
          disabled={loading || !industry}
          className="gap-1.5"
        >
          {loading ? (
            <LoaderIcon className="size-3 animate-spin" />
          ) : (
            <SparklesIcon className="size-3" />
          )}
          AI Suggest
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SparklesIcon className="size-4 text-primary" />
          Recommended Scenarios
        </div>
        {recommendations.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleApplyAll}
            className="text-xs"
          >
            Select All
          </Button>
        )}
      </div>
      {summary && (
        <p className="text-xs text-muted-foreground">{summary}</p>
      )}
      <div className="space-y-2">
        {recommendations.map((rec) => {
          const feature = features.find((f) => f.slug === rec.scenarioSlug);
          const isSelected = feature ? selectedIds.includes(feature.id) : false;
          return (
            <button
              key={rec.scenarioSlug}
              type="button"
              onClick={() => handleApply(rec.scenarioSlug)}
              disabled={isSelected || !feature}
              className="flex w-full items-start gap-3 rounded-md border bg-background p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-60"
            >
              <Badge variant="secondary" className="mt-0.5 shrink-0 text-[10px]">
                {rec.impactScore}/10
              </Badge>
              <div className="space-y-0.5">
                <p className="text-xs font-medium">
                  {feature?.label ?? rec.scenarioSlug.replace(/-/g, " ")}
                  {isSelected && (
                    <span className="ml-2 text-[10px] text-primary">Selected</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">{rec.reasoning}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
