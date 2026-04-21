"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "lucide-react";
import { useBuilderStore } from "@/lib/stores/builder-store";
import {
  contextSchema,
  type ContextFormData,
  PERSONA_OPTIONS,
  INDUSTRY_OPTIONS,
  VOICE_TONE_OPTIONS,
} from "@/lib/validations/builderSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";

interface StepContextProps {
  onNext: () => void;
}

export function StepContext({ onNext }: StepContextProps) {
  const store = useBuilderStore();
  const { customerName, persona, industry, updateContext } = store;

  const hasBrandDetails = !!(
    store.productName ||
    store.tagline ||
    store.primaryColor ||
    store.accentColor ||
    store.voiceTone
  );
  const [brandOpen, setBrandOpen] = useState(hasBrandDetails);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContextFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contextSchema) as any,
    defaultValues: {
      customerName: customerName || "",
      persona: persona as ContextFormData["persona"] || undefined,
      industry: industry as ContextFormData["industry"] || undefined,
      productName: store.productName || "",
      tagline: store.tagline || "",
      primaryColor: store.primaryColor || "",
      accentColor: store.accentColor || "",
      voiceTone: store.voiceTone as ContextFormData["voiceTone"] || undefined,
    },
  });

  const watchPrimary = watch("primaryColor");
  const watchAccent = watch("accentColor");

  function onValid(data: ContextFormData) {
    trackEvent("Wizard Step Submitted", {
      step: 1,
      customer_name_length: data.customerName.length,
      persona: data.persona,
      industry: data.industry,
      has_brand_details: !!(data.productName || data.tagline || data.primaryColor),
    });
    updateContext({
      customerName: data.customerName,
      persona: data.persona,
      industry: data.industry,
      productName: data.productName ?? "",
      tagline: data.tagline ?? "",
      primaryColor: data.primaryColor ?? "",
      accentColor: data.accentColor ?? "",
      voiceTone: data.voiceTone ?? "",
    });
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Base Context & Persona</h2>
        <p className="text-sm text-muted-foreground">
          Who is this demo for? Set the customer context and target persona.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          placeholder="e.g. Acme Corp"
          {...register("customerName")}
        />
        {errors.customerName && (
          <p className="text-sm text-destructive">{errors.customerName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Persona</Label>
        <Controller
          name="persona"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a persona" />
              </SelectTrigger>
              <SelectContent>
                {PERSONA_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.persona && (
          <p className="text-sm text-destructive">{errors.persona.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Industry</Label>
        <Controller
          name="industry"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.industry && (
          <p className="text-sm text-destructive">{errors.industry.message}</p>
        )}
      </div>

      {/* Brand & Style (optional, collapsible) */}
      <Collapsible open={brandOpen} onOpenChange={(open) => setBrandOpen(open)}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              brandOpen && "rotate-180"
            )}
          />
          Brand & Style (optional)
        </CollapsibleTrigger>
        <CollapsibleContent>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g. Acme Bank Pro (defaults to customer name)"
                    {...register("productName")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="e.g. The safest way to manage your money"
                    {...register("tagline")}
                  />
                  {errors.tagline && (
                    <p className="text-sm text-destructive">
                      {errors.tagline.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={watchPrimary || "#4F46E5"}
                        onChange={(e) =>
                          setValue("primaryColor", e.target.value, {
                            shouldValidate: true,
                          })
                        }
                        className="size-9 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                      />
                      <Input
                        id="primaryColor"
                        placeholder="#4F46E5"
                        {...register("primaryColor")}
                      />
                    </div>
                    {errors.primaryColor && (
                      <p className="text-sm text-destructive">
                        {errors.primaryColor.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={watchAccent || "#06B6D4"}
                        onChange={(e) =>
                          setValue("accentColor", e.target.value, {
                            shouldValidate: true,
                          })
                        }
                        className="size-9 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                      />
                      <Input
                        id="accentColor"
                        placeholder="#06B6D4"
                        {...register("accentColor")}
                      />
                    </div>
                    {errors.accentColor && (
                      <p className="text-sm text-destructive">
                        {errors.accentColor.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Voice & Tone</Label>
                  <Controller
                    name="voiceTone"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {VOICE_TONE_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-end pt-2">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
