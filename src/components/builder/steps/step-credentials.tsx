"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBuilderStore } from "@/lib/stores/builder-store";
import {
  createCredentialsSchema,
  type CredentialsFormData,
} from "@/lib/validations/builderSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";

interface StepCredentialsProps {
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const FIELDS: {
  name: keyof CredentialsFormData;
  label: string;
  placeholder: string;
  help: string;
  optional?: boolean;
}[] = [
  {
    name: "segmentWriteFrontend",
    label: "Frontend Write Key",
    placeholder: "wk_...",
    help: "Found in Segment > Sources > JavaScript > Settings > Write Key",
  },
  {
    name: "segmentWriteBackend",
    label: "Backend Write Key",
    placeholder: "wk_... (optional)",
    help: "Only needed if the demo includes server-side tracking",
    optional: true,
  },
  {
    name: "segmentWorkspace",
    label: "Workspace API Token",
    placeholder: "workspace token",
    help: "Found in Segment > Settings > Workspace > API Access",
  },
  {
    name: "segmentProfileToken",
    label: "Profile API Token",
    placeholder: "profile token",
    help: "Required when Profile API is enabled. Found in Unify > Profile API",
  },
  {
    name: "supabaseUrl",
    label: "Supabase URL",
    placeholder: "https://xyz.supabase.co",
    help: "Found in Supabase > Project Settings > API > Project URL",
  },
  {
    name: "supabaseAnon",
    label: "Supabase Anon Key",
    placeholder: "eyJ...",
    help: "Found in Supabase > Project Settings > API > anon public key",
  },
];

export function StepCredentials({
  onBack,
  onSubmit,
  isSubmitting,
}: StepCredentialsProps) {
  const { keys, architecture, updateKeys } = useBuilderStore();
  const enableProfileAPI = architecture.enableProfileAPI;

  const schema = createCredentialsSchema(enableProfileAPI);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      segmentWriteFrontend: keys.segmentWriteFrontend || "",
      segmentWriteBackend: keys.segmentWriteBackend || "",
      segmentWorkspace: keys.segmentWorkspace || "",
      segmentProfileToken: keys.segmentProfileToken || "",
      supabaseUrl: keys.supabaseUrl || "",
      supabaseAnon: keys.supabaseAnon || "",
    },
  });

  const [infoOpen, setInfoOpen] = useState(false);

  function onValid(data: CredentialsFormData) {
    updateKeys(data);
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold">Credentials</h2>
          <p className="text-sm text-muted-foreground">
            Provide your Segment and Supabase credentials. These are stored
            in-memory only and never persisted to any database.
          </p>
        </div>
        <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
          <DialogTrigger
            render={
              <Button type="button" variant="ghost" size="icon-sm" />
            }
          >
            <InfoIcon className="size-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Where to find your credentials</DialogTitle>
              <DialogDescription>
                All credentials are scoped to your specific Segment workspace
                and Supabase project.
              </DialogDescription>
            </DialogHeader>
            <dl className="space-y-3 text-sm">
              {FIELDS.map((f) => (
                <div key={f.name}>
                  <dt className="font-medium">{f.label}</dt>
                  <dd className="text-muted-foreground">{f.help}</dd>
                </div>
              ))}
            </dl>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {FIELDS.map((field) => {
          const isProfileToken = field.name === "segmentProfileToken";
          const isHidden = isProfileToken && !enableProfileAPI;
          if (isHidden) return null;

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.optional && !isProfileToken && (
                  <span className="ml-1 text-muted-foreground font-normal">
                    (optional)
                  </span>
                )}
              </Label>
              <Input
                id={field.name}
                type="password"
                placeholder={field.placeholder}
                {...register(field.name)}
              />
              {errors[field.name] && (
                <p className="text-sm text-destructive">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Draft Playbook"}
        </Button>
      </div>
    </form>
  );
}
