"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SANITIZATION_MAP } from "@/lib/compiler/sanitizer";
import type { CompiledPrompt } from "@/lib/compiler/types";
import {
  baseCredentialsSchema,
  type CredentialsFormData,
} from "@/lib/validations/credentialsSchema";
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

type KeyField = keyof typeof SANITIZATION_MAP;

const KEY_LABELS: Record<KeyField, string> = {
  segmentWriteFrontend: "Frontend Write Key",
  segmentWriteBackend: "Backend Write Key (optional)",
  segmentWorkspace: "Workspace API Token",
  segmentProfileToken: "Profile API Token (optional)",
  supabaseUrl: "Supabase URL",
  supabaseAnon: "Supabase Anon Key",
};

/** Check if any prompt contains placeholder strings */
export function needsRehydration(prompts: CompiledPrompt[]): boolean {
  const placeholders = Object.values(SANITIZATION_MAP);
  return prompts.some((p) =>
    placeholders.some((ph) => p.promptText.includes(ph))
  );
}

/** Replace placeholders with real keys in all prompts */
export function rehydratePrompts(
  prompts: CompiledPrompt[],
  keys: Record<KeyField, string>
): CompiledPrompt[] {
  return prompts.map((p) => {
    let text = p.promptText;
    for (const [field, placeholder] of Object.entries(SANITIZATION_MAP)) {
      const realValue = keys[field as KeyField];
      if (realValue) {
        text = text.replaceAll(placeholder, realValue);
      }
    }
    return { ...p, promptText: text };
  });
}

interface RehydrationModalProps {
  open: boolean;
  onSubmit: (keys: Record<KeyField, string>) => void;
  onDismiss: () => void;
}

export function RehydrationModal({
  open,
  onSubmit,
  onDismiss,
}: RehydrationModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(baseCredentialsSchema),
    defaultValues: {
      segmentWriteFrontend: "",
      segmentWriteBackend: "",
      segmentWorkspace: "",
      segmentProfileToken: "",
      supabaseUrl: "",
      supabaseAnon: "",
    },
  });

  function onValid(data: CredentialsFormData) {
    const filledCount = Object.values(data).filter((v) => v && v.length > 0).length;
    trackEvent("Keys Injected", { field_count: filledCount });
    onSubmit(data as Record<KeyField, string>);
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
            {(Object.entries(KEY_LABELS) as [KeyField, string][]).map(
              ([field, label]) => (
                <div key={field} className="space-y-1">
                  <Label htmlFor={`rehydrate-${field}`} className="text-xs">
                    {label}
                  </Label>
                  <Input
                    id={`rehydrate-${field}`}
                    type="password"
                    placeholder={SANITIZATION_MAP[field]}
                    className={errors[field] ? "border-destructive" : ""}
                    {...register(field)}
                  />
                  {errors[field] && (
                    <p className="text-xs text-destructive">
                      {errors[field]?.message}
                    </p>
                  )}
                </div>
              )
            )}
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
