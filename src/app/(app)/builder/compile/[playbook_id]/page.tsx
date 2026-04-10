"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBuilderStore } from "@/lib/stores/builder-store";
import { compilePromptsWithTemplates } from "@/lib/compiler/compile";
import { sanitizePrompts } from "@/lib/compiler/sanitizer";
import { fetchScenarioTemplates } from "@/app/(app)/builder/actions";
import type { VersionMap } from "@/lib/compiler/types";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

type CompilePhase = "loading" | "compiling" | "enriching" | "saving" | "redirecting" | "error";

export default function CompilePage({
  params,
}: {
  params: Promise<{ playbook_id: string }>;
}) {
  const { playbook_id } = use(params);
  const store = useBuilderStore();
  const router = useRouter();
  const hasRun = useRef(false);

  const [phase, setPhase] = useState<CompilePhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  const phaseRef = useRef<CompilePhase>("loading");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    startTime.current = Date.now();

    function setTrackedPhase(p: CompilePhase) {
      phaseRef.current = p;
      setPhase(p);
      trackEvent("Compilation Phase Changed", {
        playbook_id,
        phase: p,
        elapsed_ms: Date.now() - startTime.current,
      });
    }

    async function run() {
      try {
        // 1. Fetch NPM versions
        const res = await fetch("/api/dependencies/versions");
        if (!res.ok) throw new Error("Failed to fetch dependency versions");
        const { versions }: { versions: VersionMap } = await res.json();

        // 2. Fetch scenario templates from DB
        setTrackedPhase("compiling");
        const { templates: dbTemplates, invalidIds } =
          await fetchScenarioTemplates(store.selectedScenarios);

        if (invalidIds.length > 0) {
          toast.warning("A selected scenario is no longer available");
          store.updateContext({
            selectedScenarios: store.selectedScenarios.filter(
              (id) => !invalidIds.includes(id)
            ),
          });
        }

        // 3. Compile Variant A (real keys) using DB-driven templates
        const input = {
          customerName: store.customerName,
          industry: store.industry,
          persona: store.persona,
          architecture: store.architecture,
          selectedScenarios: store.selectedScenarios,
          keys: store.keys,
          versions,
        };
        let variantA = compilePromptsWithTemplates(input, dbTemplates);

        // 3b. AI Enrichment (best-effort — falls back to original on failure)
        setTrackedPhase("enriching");
        try {
          const enrichRes = await fetch("/api/ai/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompts: variantA,
              context: {
                persona: store.persona,
                industry: store.industry,
                customerName: store.customerName,
                architecture: store.architecture,
              },
            }),
          });
          if (enrichRes.ok) {
            const { enrichedPrompts } = await enrichRes.json();
            variantA = enrichedPrompts;
          }
        } catch {
          // AI enrichment is best-effort — continue with original prompts
        }

        // 4. Sanitize to Variant B (placeholders)
        setTrackedPhase("saving");
        const variantB = sanitizePrompts(variantA, store.keys);

        // 5. PATCH database with Variant B only
        const patchRes = await fetch(`/api/playbooks/${playbook_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ generated_prompts: variantB }),
        });

        if (!patchRes.ok) {
          let errorMsg = "Failed to save playbook";
          try {
            const data = await patchRes.json();
            errorMsg = data.error || errorMsg;
          } catch {
            // Response wasn't JSON — use default message
          }
          throw new Error(errorMsg);
        }

        // 6. Redirect to playbook viewer
        setTrackedPhase("redirecting");
        trackEvent("Compilation Completed", {
          playbook_id,
          total_ms: Date.now() - startTime.current,
          prompt_count: variantB.length,
        });
        router.push(`/playbooks/${playbook_id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred";
        trackEvent("Compilation Failed", {
          playbook_id,
          error: msg,
          failed_phase: phaseRef.current,
        });
        setErrorMessage(msg);
        setPhase("error");
      }
    }

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === "error") {
    return (
      <div className="space-y-4 py-12 text-center">
        <AlertTriangleIcon className="mx-auto size-10 text-destructive" />
        <h2 className="text-xl font-semibold">Compilation Failed</h2>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" onClick={() => {
          trackEvent("Compilation Retried", { playbook_id });
          window.location.reload();
        }}>
          Retry
        </Button>
      </div>
    );
  }

  const labels: Record<string, string> = {
    loading: "Fetching dependency versions...",
    compiling: "Compiling prompts...",
    enriching: "Enhancing prompts with AI...",
    saving: "Saving playbook...",
    redirecting: "Opening playbook...",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">{labels[phase]}</p>
    </div>
  );
}
