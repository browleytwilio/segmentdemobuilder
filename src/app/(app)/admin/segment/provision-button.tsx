"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2Icon, RocketIcon } from "lucide-react";

interface ProvisionResult {
  name: string;
  type: "computed_trait" | "audience";
  status: "created" | "skipped" | "failed";
  id?: string;
  error?: string;
}

interface ProvisionResponse {
  summary: { total: number; created: number; skipped: number; failed: number };
  results: ProvisionResult[];
  error?: string;
}

export function ProvisionButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProvisionResponse | null>(null);

  async function handleProvision() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/segment/provision", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        summary: { total: 0, created: 0, skipped: 0, failed: 0 },
        results: [],
        error: String(err),
      });
    }

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleProvision} disabled={loading} size="sm">
        {loading ? (
          <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
        ) : (
          <RocketIcon className="mr-1.5 size-3.5" />
        )}
        {loading ? "Provisioning..." : "Provision All"}
      </Button>

      {result?.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {result.error}
        </div>
      )}

      {result?.summary && !result.error && (
        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Total: <strong>{result.summary.total}</strong>
            </span>
            <span className="text-green-500">
              Created: <strong>{result.summary.created}</strong>
            </span>
            <span className="text-muted-foreground">
              Skipped: <strong>{result.summary.skipped}</strong>
            </span>
            {result.summary.failed > 0 && (
              <span className="text-destructive">
                Failed: <strong>{result.summary.failed}</strong>
              </span>
            )}
          </div>

          {result.results.filter((r) => r.status === "failed").length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-destructive">Failed:</p>
              {result.results
                .filter((r) => r.status === "failed")
                .map((r) => (
                  <p
                    key={r.name}
                    className="text-xs text-muted-foreground font-mono"
                  >
                    {r.type}: {r.name} — {r.error}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
