import type { DemoArchitecture } from "@/lib/stores/builder-store";
import type { DatabaseProvider, AuthProvider } from "./providers";

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
  keys: Record<string, string>;
  versions: VersionMap;
  databaseProvider: DatabaseProvider;
  authProvider: AuthProvider;
  productName?: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
  voiceTone?: string;
}

export interface DemoConfig {
  persona: string;
  architecture: DemoArchitecture;
  selectedScenarios: string[];
  scenarioSlugs?: Record<string, string>; // { [featureId]: slug } — new playbooks only
  databaseProvider?: DatabaseProvider;
  authProvider?: AuthProvider;
  productName?: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
  voiceTone?: string;
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
  progress?: number[];
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
