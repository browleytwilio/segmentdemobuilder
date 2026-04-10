"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlaybookFromTemplate } from "@/app/(app)/builder/actions";
import type { PlaybookTemplateRow } from "@/lib/compiler/types";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

interface TemplatePickerProps {
  templates: PlaybookTemplateRow[];
}

export function TemplatePicker({ templates }: TemplatePickerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(template: PlaybookTemplateRow) {
    setLoading(template.id);
    const result = await createPlaybookFromTemplate(template.id);
    if (result.error) {
      toast.error(result.error);
      setLoading(null);
      return;
    }
    if (result.id) {
      trackEvent("Template Used", {
        template_id: template.id,
        template_name: template.name,
        industry: template.industry,
      });
      router.push(`/builder/compile/${result.id}`);
    }
  }

  if (templates.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No templates available yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <Card key={t.id} className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle className="text-base">{t.name}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
            <div className="flex gap-1.5 pt-2">
              <Badge variant="outline">{t.industry}</Badge>
              <Badge variant="outline">{t.persona}</Badge>
            </div>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              size="sm"
              disabled={loading === t.id}
              onClick={() => handleSelect(t)}
            >
              {loading === t.id && (
                <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
              )}
              Use Template
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
