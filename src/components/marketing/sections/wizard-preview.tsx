"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";
import { useCases } from "@/lib/marketing/data/use-cases";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Architecture {
  enableSESidebar: boolean;
  enableSeededProfiles: boolean;
  enableProfileAPI: boolean;
  enableIntentPredictions: boolean;
  enableSecondPagePers: boolean;
}

const archLabels: Record<keyof Architecture, { label: string; desc: string }> = {
  enableSESidebar: {
    label: "SE Sidebar",
    desc: "Real-time event stream visualization",
  },
  enableSeededProfiles: {
    label: "Seeded Profiles",
    desc: "Pre-populated demo user data",
  },
  enableProfileAPI: {
    label: "Profile API",
    desc: "Live trait lookups for personalization",
  },
  enableIntentPredictions: {
    label: "Intent Predictions",
    desc: "AI-driven behavioral scoring",
  },
  enableSecondPagePers: {
    label: "Second-Page Personalization",
    desc: "Content adapts based on prior events",
  },
};

const industries = ["E-commerce & Retail", "B2B SaaS", "FinTech", "Media & Entertainment"];
const personas = ["CMO", "CTO / Engineering", "Product Manager", "Data Team"];

/* ------------------------------------------------------------------ */
/* Step components                                                     */
/* ------------------------------------------------------------------ */

function StepContext({
  customerName,
  setCustomerName,
  industry,
  setIndustry,
  persona,
  setPersona,
}: {
  customerName: string;
  setCustomerName: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  persona: string;
  setPersona: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          Customer Name
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Acme Corp"
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-marketing-blue/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          Industry
        </label>
        <div className="grid grid-cols-2 gap-2">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs text-left transition-all",
                industry === ind
                  ? "border-marketing-blue/30 bg-marketing-blue/10 text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12]"
              )}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          Persona
        </label>
        <div className="grid grid-cols-2 gap-2">
          {personas.map((p) => (
            <button
              key={p}
              onClick={() => setPersona(p)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs text-left transition-all",
                persona === p
                  ? "border-marketing-purple/30 bg-marketing-purple/10 text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepArchitecture({
  arch,
  toggle,
}: {
  arch: Architecture;
  toggle: (key: keyof Architecture) => void;
}) {
  return (
    <div className="space-y-3">
      {(Object.keys(archLabels) as (keyof Architecture)[]).map((key) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
            arch[key]
              ? "border-marketing-green/25 bg-marketing-green/[0.06]"
              : "border-white/[0.06] bg-white/[0.02]"
          )}
        >
          <div>
            <div className="text-xs font-medium text-white/80">
              {archLabels[key].label}
            </div>
            <div className="text-[10px] text-white/30">
              {archLabels[key].desc}
            </div>
          </div>
          <div
            className={cn(
              "flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors",
              arch[key] ? "bg-marketing-green/40" : "bg-white/10"
            )}
          >
            <motion.div
              animate={{ x: arch[key] ? 16 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "h-4 w-4 rounded-full",
                arch[key] ? "bg-marketing-green" : "bg-white/30"
              )}
            />
          </div>
        </button>
      ))}
    </div>
  );
}

function StepScenarios({
  industry,
  selected,
  toggle,
}: {
  industry: string;
  selected: string[];
  toggle: (name: string) => void;
}) {
  // Find scenarios matching the industry
  const matchingUseCase = useCases.find((uc) =>
    industry.toLowerCase().includes(uc.industry.toLowerCase().split(" ")[0])
  );
  const scenarios = matchingUseCase?.scenarios ?? useCases[0].scenarios;

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-white/30">
        Scenarios for {industry || "your industry"}:
      </p>
      {scenarios.map((s) => {
        const isSelected = selected.includes(s.name);
        return (
          <button
            key={s.name}
            onClick={() => toggle(s.name)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all",
              isSelected
                ? "border-marketing-blue/25 bg-marketing-blue/[0.06]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                isSelected
                  ? "border-marketing-blue bg-marketing-blue"
                  : "border-white/20"
              )}
            >
              {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
            </div>
            <div>
              <div className="text-xs font-medium text-white/80">{s.name}</div>
              <div className="text-[10px] text-white/30 line-clamp-2">
                {s.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StepPreview({
  customerName,
  industry,
  persona,
  scenarios,
}: {
  customerName: string;
  industry: string;
  persona: string;
  scenarios: string[];
}) {
  const [compiled, setCompiled] = useState(false);

  if (!compiled) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm text-white/50 text-center">
          Ready to compile <span className="text-white/80 font-medium">{customerName || "your"}</span> playbook
          with {scenarios.length} scenario{scenarios.length !== 1 ? "s" : ""}
        </p>
        <Button
          onClick={() => { trackEvent("CTA Clicked", { cta: "Compile Preview", location: "wizard_preview" }); setCompiled(true); }}
          className="bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-90"
        >
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          Compile Preview
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 text-xs text-marketing-green">
        <Check className="h-3.5 w-3.5" />
        <span>Compiled in 3.2s — {3 + scenarios.length} prompts generated</span>
      </div>
      {[
        { step: 1, title: "Project Scaffolding", desc: `Initialize Next.js app for ${customerName || "Acme Corp"}` },
        { step: 2, title: "Segment SDK Setup", desc: "Install @segment/analytics-next and configure tracking" },
        { step: 3, title: "Architecture Foundation", desc: `Set up ${industry || "E-commerce"} data model and routes` },
        ...scenarios.slice(0, 2).map((s, i) => ({
          step: 4 + i,
          title: s,
          desc: `Implement ${s.toLowerCase()} for ${persona || "CMO"} demo`,
        })),
      ].map((prompt) => (
        <div
          key={prompt.step}
          className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-marketing-blue/20 text-[10px] font-bold text-marketing-blue">
              {prompt.step}
            </span>
            <span className="text-xs font-medium text-white/70">
              {prompt.title}
            </span>
          </div>
          <p className="mt-1 pl-7 text-[10px] text-white/30">{prompt.desc}</p>
        </div>
      ))}
      <p className="text-center text-[10px] text-white/25 pt-2">
        Sign in to compile real, executable prompts for Claude Code
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main wizard preview                                                 */
/* ------------------------------------------------------------------ */

const stepMeta = [
  { label: "Context", color: "marketing-blue" },
  { label: "Architecture", color: "marketing-purple" },
  { label: "Scenarios", color: "marketing-green" },
  { label: "Preview", color: "marketing-cyan" },
];

export function WizardPreview() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form state
  const [customerName, setCustomerName] = useState("Acme Corp");
  const [industry, setIndustry] = useState("E-commerce & Retail");
  const [persona, setPersona] = useState("CMO");
  const [arch, setArch] = useState<Architecture>({
    enableSESidebar: true,
    enableSeededProfiles: true,
    enableProfileAPI: false,
    enableIntentPredictions: false,
    enableSecondPagePers: false,
  });
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([
    "Second-Page Personalization",
  ]);

  const toggleArch = (key: keyof Architecture) =>
    setArch((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleScenario = (name: string) =>
    setSelectedScenarios((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );

  const goTo = (target: number) => {
    trackEvent("Marketing Interaction", { component: "wizard_preview", interaction: "step_navigated", properties: { from: step, to: target } });
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const variants = useMemo(
    () => ({
      enter: (dir: number) => ({
        x: dir > 0 ? 40 : -40,
        opacity: 0,
      }),
      center: { x: 0, opacity: 1 },
      exit: (dir: number) => ({
        x: dir > 0 ? -40 : 40,
        opacity: 0,
      }),
    }),
    []
  );

  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-white/[0.10] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.05] bg-white/[0.02] px-4 py-2.5">
          <div className="flex gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
          </div>
          <div className="mx-auto text-[10px] text-white/30">
            Try the wizard — no sign-in needed
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1 border-b border-white/[0.05] px-4 py-2">
          {stepMeta.map((s, i) => (
            <button
              key={s.label}
              onClick={() => goTo(i)}
              className="flex flex-1 items-center gap-1.5"
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  i < step
                    ? `bg-${s.color}/20 text-${s.color}`
                    : i === step
                      ? `bg-${s.color}/30 text-white`
                      : "bg-white/[0.06] text-white/25"
                )}
              >
                {i < step ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-[10px] transition-colors",
                  i === step ? "text-white/70" : "text-white/25"
                )}
              >
                {s.label}
              </span>
              {i < stepMeta.length - 1 && (
                <div
                  className={cn(
                    "mx-1 hidden h-px flex-1 sm:block",
                    i < step ? `bg-${s.color}/20` : "bg-white/[0.06]"
                  )}
                />
              )}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="relative min-h-[320px] overflow-hidden px-4 py-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <StepContext
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  industry={industry}
                  setIndustry={setIndustry}
                  persona={persona}
                  setPersona={setPersona}
                />
              )}
              {step === 1 && (
                <StepArchitecture arch={arch} toggle={toggleArch} />
              )}
              {step === 2 && (
                <StepScenarios
                  industry={industry}
                  selected={selectedScenarios}
                  toggle={toggleScenario}
                />
              )}
              {step === 3 && (
                <StepPreview
                  customerName={customerName}
                  industry={industry}
                  persona={persona}
                  scenarios={selectedScenarios}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="text-xs text-white/40 hover:text-white/70 disabled:opacity-20"
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back
          </Button>
          <span className="text-[10px] text-white/20">
            Step {step + 1} of {stepMeta.length}
          </span>
          {step < stepMeta.length - 1 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goTo(step + 1)}
              className="text-xs text-marketing-blue hover:text-marketing-blue/80"
            >
              Next
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              render={<a href="/sign-in" />}
              onClick={() => trackEvent("CTA Clicked", { cta: "Sign In to Build", location: "wizard_preview" })}
              className="bg-gradient-to-r from-marketing-blue to-marketing-purple text-xs text-white hover:opacity-90"
            >
              Sign In to Build
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
