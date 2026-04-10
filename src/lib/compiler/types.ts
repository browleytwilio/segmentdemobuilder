import type { DemoArchitecture, BuilderState } from "@/lib/stores/builder-store";

export interface CompiledPrompt {
  stepNumber: number;
  title: string;
  expectedOutput: string;
  promptText: string;
}

export type VersionMap = Record<string, string>;

export interface CompilerInput {
  customerName: string;
  industry: string;
  persona: string;
  architecture: DemoArchitecture;
  selectedScenarios: string[];
  keys: BuilderState["keys"];
  versions: VersionMap;
}

export interface DemoConfig {
  persona: string;
  architecture: DemoArchitecture;
  selectedScenarios: string[];
  scenarioSlugs?: Record<string, string>; // { [featureId]: slug } — new playbooks only
}

export interface PlaybookRow {
  id: string;
  customer_name: string;
  industry: string;
  status: "draft" | "completed";
  demo_config: DemoConfig;
  generated_prompts: CompiledPrompt[];
  created_at: string;
  updated_at: string;
}

export type PlaybookSummary = Pick<
  PlaybookRow,
  "id" | "customer_name" | "industry" | "status" | "updated_at"
>;
