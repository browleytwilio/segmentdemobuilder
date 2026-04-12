"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildSanitizationMap, SANITIZATION_MAP } from "@/lib/compiler/sanitizer";
import { DATABASE_PROVIDERS } from "@/lib/compiler/providers";
import type { DatabaseProvider } from "@/lib/compiler/providers";
import type { CompiledPrompt } from "@/lib/compiler/types";
import { createProviderCredentialsSchema } from "@/lib/validations/credentialsSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics/events";

const SEGMENT_LABELS: Record<string, string> = {
  segmentWriteFrontend: "Frontend Write Key",
  segmentWriteBackend: "Backend Write Key (optional)",
  segmentWorkspace: "Workspace API Token",
  segmentProfileToken: "Profile API Token (optional)",
};

function buildKeyLabels(databaseProvider: DatabaseProvider): Record<string, string> {
  const labels = { ...SEGMENT_LABELS };
  for (const field of DATABASE_PROVIDERS[databaseProvider].credentialFields) {
    labels[field.name] = field.label;
  }
  return labels;
}

/** Check if any prompt contains placeholder strings */
export function needsRehydration(
  prompts: CompiledPrompt[],
  databaseProvider: DatabaseProvider = "supabase"
): boolean {
  const map = buildSanitizationMap(databaseProvider);
  const placeholders = Object.values(map);
  return prompts.some((p) =>
    placeholders.some((ph) => p.promptText.includes(ph))
  );
}

/** Replace placeholders with real keys in all prompts */
export function rehydratePrompts(
  prompts: CompiledPrompt[],
  keys: Record<string, string>,
  databaseProvider: DatabaseProvider = "supabase"
): CompiledPrompt[] {
  const map = buildSanitizationMap(databaseProvider);
  return prompts.map((p) => {
    let text = p.promptText;
    for (const [field, placeholder] of Object.entries(map)) {
      const realValue = keys[field];
      if (realValue) {
        text = text.replaceAll(placeholder, realValue);
      }
    }
    return { ...p, promptText: text };
  });
}

interface RehydrationModalProps {
  open: boolean;
  databaseProvider?: DatabaseProvider;
  onSubmit: (keys: Record<string, string>) => void;
  onDismiss: () => void;
}

export function RehydrationModal({
  open,
  databaseProvider = "supabase",
  onSubmit,
  onDismiss,
}: RehydrationModalProps) {
  const keyLabels = useMemo(() => buildKeyLabels(databaseProvider), [databaseProvider]);
  const sanitizationMap = useMemo(() => buildSanitizationMap(databaseProvider), [databaseProvider]);
  const schema = useMemo(
    () => createProviderCredentialsSchema(databaseProvider, false),
    [databaseProvider]
  );

  const defaultValues = useMemo(() => {
    const vals: Record<string, string> = {};
    for (const field of Object.keys(keyLabels)) {
      vals[field] = "";
    }
    return vals;
  }, [keyLabels]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  function onValid(data: Record<string, string>) {
    const filledCount = Object.values(data).filter((v) => v && v.length > 0).length;
    trackEvent("Keys Injected", { field_count: filledCount });
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        trackEvent("Rehydration Skipped", {});
        onDismiss();
      }
    }}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onValid)}>
          <DialogHeader>
            <DialogTitle>Provide Your API Keys</DialogTitle>
            <DialogDescription>
              This playbook was loaded from the database with masked
              credentials. Enter your keys to execute the prompts. Keys are
              kept in browser memory only and are never saved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {Object.entries(keyLabels).map(([field, label]) => (
              <div key={field} className="space-y-1">
                <Label htmlFor={`rehydrate-${field}`} className="text-xs">
                  {label}
                </Label>
                <Input
                  id={`rehydrate-${field}`}
                  type="password"
                  placeholder={sanitizationMap[field] ?? ""}
                  className={errors[field] ? "border-destructive" : ""}
                  {...register(field)}
                />
                {errors[field] && (
                  <p className="text-xs text-destructive">
                    {String(errors[field]?.message)}
                  </p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              trackEvent("Rehydration Skipped", {});
              onDismiss();
            }}>
              Skip (use placeholders)
            </Button>
            <Button type="submit">Inject Keys</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
