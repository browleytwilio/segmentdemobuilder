"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBuilderStore } from "@/lib/stores/builder-store";
import {
  contextSchema,
  type ContextFormData,
  PERSONA_OPTIONS,
  INDUSTRY_OPTIONS,
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
import { trackEvent } from "@/lib/analytics/events";

interface StepContextProps {
  onNext: () => void;
}

export function StepContext({ onNext }: StepContextProps) {
  const { customerName, persona, industry, updateContext } = useBuilderStore();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContextFormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: {
      customerName: customerName || "",
      persona: persona as ContextFormData["persona"] || undefined,
      industry: industry as ContextFormData["industry"] || undefined,
    },
  });

  function onValid(data: ContextFormData) {
    trackEvent("Wizard Step Submitted", {
      step: 1,
      customer_name_length: data.customerName.length,
      persona: data.persona,
      industry: data.industry,
    });
    updateContext({
      customerName: data.customerName,
      persona: data.persona,
      industry: data.industry,
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

      <div className="flex justify-end pt-2">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
