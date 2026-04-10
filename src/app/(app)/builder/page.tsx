"use client";

import { useState } from "react";
import { BuilderWizard } from "@/components/builder/builder-wizard";
import { NLBuilderEntry } from "@/components/builder/nl-builder-entry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListOrderedIcon, SparklesIcon } from "lucide-react";

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState("wizard");

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
        </TabsList>
      </div>

      <TabsContent value="wizard">
        <BuilderWizard />
      </TabsContent>

      <TabsContent value="describe">
        <NLBuilderEntry onSwitchToWizard={() => setActiveTab("wizard")} />
      </TabsContent>
    </Tabs>
  );
}
