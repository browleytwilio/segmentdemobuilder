"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Radio, Code, Zap, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";
import { scenarioDetails, type ScenarioDetail } from "@/lib/marketing/data/scenario-details";

type Tab = "comparison" | "events" | "code";

interface ScenarioExplorerCardProps {
  name: string;
  description: string;
  index: number;
}

export function ScenarioExplorerCard({
  name,
  description,
  index,
}: ScenarioExplorerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("comparison");
  const detail: ScenarioDetail | undefined = scenarioDetails[name];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => { if (!expanded) trackEvent("Marketing Interaction", { component: "scenario_explorer", interaction: "expanded", properties: { scenario_name: name } }); setExpanded(!expanded); }}
        className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {expanded && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
              className="flex h-2 w-2 rounded-full bg-marketing-green"
            />
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05] px-6 pb-6 pt-4">
              {/* Tabs */}
              <div className="mb-4 flex gap-1">
                {([
                  { id: "comparison" as Tab, label: "Before / After", icon: ArrowRightLeft },
                  { id: "events" as Tab, label: "Events", icon: Radio },
                  { id: "code" as Tab, label: "Code", icon: Code },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { trackEvent("Marketing Interaction", { component: "scenario_explorer", interaction: "tab_switched", properties: { tab: tab.id } }); setActiveTab(tab.id); }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-marketing-blue/15 text-marketing-blue"
                        : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                    )}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {activeTab === "comparison" && (
                  <motion.div
                    key="comparison"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {/* Before */}
                    <div className="rounded-lg border border-white/[0.06] bg-black/30 p-4">
                      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-red-400/60">
                        Before
                      </div>
                      <p className="text-xs leading-relaxed text-white/40">
                        {detail.beforeDescription}
                      </p>
                    </div>
                    {/* After */}
                    <div className="rounded-lg border border-marketing-green/15 bg-marketing-green/[0.03] p-4">
                      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-marketing-green/60">
                        After
                      </div>
                      <p className="text-xs leading-relaxed text-white/50">
                        {detail.afterDescription}
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "events" && (
                  <motion.div
                    key="events"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {detail.events.map((ev, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-md border border-white/[0.05] bg-black/30 px-3 py-2"
                      >
                        <Zap className="h-3 w-3 shrink-0 text-marketing-blue/60" />
                        <code className="text-[11px] text-white/50 font-mono">
                          {ev}
                        </code>
                      </div>
                    ))}
                    <p className="mt-2 text-[10px] text-white/25">
                      These Segment events power the personalization in this scenario.
                    </p>
                  </motion.div>
                )}

                {activeTab === "code" && (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/50">
                      <div className="flex items-center gap-1.5 border-b border-white/[0.05] bg-white/[0.02] px-3 py-1.5">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
                          <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
                          <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
                        </div>
                        <span className="text-[9px] text-white/30">
                          scenario.tsx
                        </span>
                      </div>
                      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-white/40">
                        <code>{detail.codeSnippet}</code>
                      </pre>
                    </div>
                    <p className="mt-2 text-[10px] text-white/25">
                      Generated by the Demo Builder&apos;s prompt compiler.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
