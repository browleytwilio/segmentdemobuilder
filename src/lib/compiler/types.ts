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
  visibility?: PlaybookVisibility;
  demo_config: DemoConfig;
  generated_prompts: CompiledPrompt[];
  cloned_from?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaybookTemplateRow {
  id: string;
  name: string;
  description: string;
  industry: string;
  persona: string;
  demo_config: DemoConfig;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type PlaybookVisibility = "private" | "shared" | "public";

export interface PlaybookSummary {
  id: string;
  customer_name: string;
  industry: string;
  status: "draft" | "completed";
  updated_at: string;
  is_favorite: boolean;
  visibility?: PlaybookVisibility;
  user_email?: string;
  tags?: Tag[];
}

export interface PlaybookComment {
  id: string;
  playbook_id: string;
  user_id: string;
  user_email?: string;
  content: string;
  created_at: string;
  updated_at: string;
}
