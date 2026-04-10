"use server";

import { createClient } from "@/lib/supabase/server";
import type { DemoArchitecture } from "@/lib/stores/builder-store";
import type { DemoConfig } from "@/lib/compiler/types";

interface CreatePlaybookInput {
  customer_name: string;
  industry: string;
  demo_config: DemoConfig;
}

export async function createPlaybook(input: CreatePlaybookInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("playbooks")
    .insert({
      user_id: user.id,
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

  // Fetch features and their linked templates separately for clean typing
  const { data: features, error } = await supabase
    .from("demo_features")
    .select("id, slug, prompt_template_id")
    .in("id", featureIds);

  if (error || !features) return { templates: [], invalidIds: featureIds };

  const templateIds = features.map((f) => f.prompt_template_id);
  const { data: tpls } = await supabase
    .from("prompt_templates")
    .select("id, name, content")
    .in("id", templateIds)
    .eq("is_active", true);

  const tplMap = new Map((tpls ?? []).map((t) => [t.id, t]));

  const templates: { featureId: string; slug: string; templateName: string; content: string }[] = [];
  const validIds = new Set<string>();

  for (const f of features) {
    const tpl = tplMap.get(f.prompt_template_id);
    if (tpl && tpl.content) {
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
