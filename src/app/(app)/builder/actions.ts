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
