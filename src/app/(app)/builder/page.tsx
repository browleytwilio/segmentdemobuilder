"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { BuilderWizard } from "@/components/builder/builder-wizard";
import { TemplatePicker } from "@/components/builder/template-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListOrderedIcon, SparklesIcon, LayoutTemplateIcon } from "lucide-react";
import { getPlaybookTemplates } from "./actions";
import type { PlaybookTemplateRow } from "@/lib/compiler/types";

const NLBuilderEntry = dynamic(
  () => import("@/components/builder/nl-builder-entry").then((m) => m.NLBuilderEntry),
  { ssr: false }
);

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState("wizard");
  const [templates, setTemplates] = useState<PlaybookTemplateRow[]>([]);

  useEffect(() => {
    getPlaybookTemplates().then(setTemplates);
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex justify-center py-6 print:hidden">
        <TabsList>
          <TabsTrigger value="wizard" className="gap-1.5">
            <ListOrderedIcon className="size-3.5" />
            Step-by-Step
          </TabsTrigger>
          <TabsTrigger value="describe" className="gap-1.5">
            <SparklesIcon className="size-3.5" />
            Describe with AI
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <LayoutTemplateIcon className="size-3.5" />
            Templates
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="wizard">
        <BuilderWizard />
      </TabsContent>

      <TabsContent value="describe">
        <NLBuilderEntry onSwitchToWizard={() => setActiveTab("wizard")} />
      </TabsContent>

      <TabsContent value="templates">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Start from a Template</h2>
            <p className="text-sm text-muted-foreground">
              Choose a pre-configured demo template to get started quickly.
            </p>
          </div>
          <TemplatePicker templates={templates} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
