"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient, ensureProfile } from "@/lib/supabase/server";
import type { DemoArchitecture } from "@/lib/stores/builder-store";
import type { DemoConfig, PlaybookTemplateRow } from "@/lib/compiler/types";
import { revalidatePath } from "next/cache";

interface CreatePlaybookInput {
  customer_name: string;
  industry: string;
  demo_config: DemoConfig;
}

export async function createPlaybook(input: CreatePlaybookInput) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  await ensureProfile(userId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbooks")
    .insert({
      user_id: userId,
      customer_name: input.customer_name,
      industry: input.industry,
      status: "draft" as const,
      demo_config: input.demo_config,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { id: data.id };
}

/** Fetch active demo features for a given industry (used by wizard Step 3). */
export async function getDemoFeaturesForWizard(industry: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demo_features")
    .select("id, slug, label, description")
    .eq("industry", industry)
    .eq("is_active", true)
    .order("display_order");

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

/** Fetch scenario template content for compilation. Returns templates + any invalid IDs. */
export async function fetchScenarioTemplates(featureIds: string[]) {
  if (featureIds.length === 0) return { templates: [], invalidIds: [] };

  const supabase = await createClient();

  // Single joined query: demo_features → prompt_templates via FK
  // Replaces two sequential round trips (N+1 pattern).
  const { data: features, error } = await supabase
    .from("demo_features")
    .select("id, slug, prompt_templates(id, name, content, is_active)")
    .in("id", featureIds);

  if (error || !features) return { templates: [], invalidIds: featureIds };

  const templates: { featureId: string; slug: string; templateName: string; content: string }[] = [];
  const validIds = new Set<string>();

  for (const f of features) {
    const raw = f.prompt_templates as unknown;
    const tpl = Array.isArray(raw) ? raw[0] as { id: string; name: string; content: string; is_active: boolean } | undefined : raw as { id: string; name: string; content: string; is_active: boolean } | null;
    if (tpl && tpl.is_active && tpl.content) {
      validIds.add(f.id);
      templates.push({
        featureId: f.id,
        slug: f.slug,
        templateName: tpl.name,
        content: tpl.content,
      });
    }
  }

  const invalidIds = featureIds.filter((id) => !validIds.has(id));
  return { templates, invalidIds };
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function getPlaybookTemplates(): Promise<PlaybookTemplateRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbook_templates")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error || !data) return [];
  return data as PlaybookTemplateRow[];
}

export async function createPlaybookFromTemplate(
  templateId: string
): Promise<{ id?: string; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  await ensureProfile(userId);
  const supabase = await createClient();

  const { data: template, error: fetchError } = await supabase
    .from("playbook_templates")
    .select("name, industry, persona, demo_config")
    .eq("id", templateId)
    .eq("is_active", true)
    .single();

  if (fetchError || !template) return { error: "Template not found" };

  const demoConfig = template.demo_config as DemoConfig;
  // Ensure persona from template is in the config
  if (!demoConfig.persona) {
    demoConfig.persona = template.persona;
  }
  if (!demoConfig.databaseProvider) {
    demoConfig.databaseProvider = "supabase";
  }
  if (!demoConfig.authProvider) {
    demoConfig.authProvider = "none";
  }

  const { data, error } = await supabase
    .from("playbooks")
    .insert({
      user_id: userId,
      customer_name: "",
      industry: template.industry,
      status: "draft" as const,
      demo_config: demoConfig,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { id: data.id };
}
