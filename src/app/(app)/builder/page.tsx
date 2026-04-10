"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { BuilderWizard } from "@/components/builder/builder-wizard";
import { TemplatePicker } from "@/components/builder/template-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListOrderedIcon, SparklesIcon, LayoutTemplateIcon } from "lucide-react";
import { getPlaybookTemplates } from "./actions";
import { trackEvent } from "@/lib/analytics/events";
import type { PlaybookTemplateRow } from "@/lib/compiler/types";

const NLBuilderEntry = dynamic(
  () => import("@/components/builder/nl-builder-entry").then((m) => m.NLBuilderEntry),
  { ssr: false }
);

const BUILDER_MODES = [
  {
    value: "wizard",
    label: "Step-by-Step",
    icon: ListOrderedIcon,
    description: "Guided wizard",
  },
  {
    value: "describe",
    label: "Describe with AI",
    icon: SparklesIcon,
    description: "Natural language",
  },
  {
    value: "templates",
    label: "Templates",
    icon: LayoutTemplateIcon,
    description: "Quick start",
  },
] as const;

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState("wizard");
  const [templates, setTemplates] = useState<PlaybookTemplateRow[]>([]);

  useEffect(() => {
    getPlaybookTemplates().then(setTemplates);
  }, []);

  function handleTabChange(value: string) {
    setActiveTab(value);
    trackEvent("Builder Mode Selected", {
      mode: value as "wizard" | "describe" | "templates",
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Page header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create a Playbook</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how you want to build your demo playbook
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Mode selector */}
        <div className="flex justify-center mb-8 print:hidden">
          <TabsList className="h-auto p-1 gap-1">
            {BUILDER_MODES.map(({ value, label, icon: Icon, description }) => (
              <TabsTrigger key={value} value={value} className="flex-col gap-0.5 px-5 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-[0.6rem] text-muted-foreground font-normal hidden sm:block">
                  {description}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="wizard">
          <BuilderWizard />
        </TabsContent>

        <TabsContent value="describe">
          <NLBuilderEntry onSwitchToWizard={() => handleTabChange("wizard")} />
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Start from a Template</h2>
              <p className="text-sm text-muted-foreground">
                Choose a pre-configured demo template to get started quickly.
              </p>
            </div>
            <TemplatePicker templates={templates} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
