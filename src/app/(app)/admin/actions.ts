"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

const PROTECTED_EMAIL = "browley@twilio.com";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return { supabase: null, userId: null, error: "Not authenticated" as const };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "super_admin")
    return { supabase, userId, error: "Forbidden" as const };
  return { supabase, userId, error: null };
}

// --- User Management ---

export async function getAdminUsers() {
  const admin = await requireAdmin();
  if (admin.error) return { data: null, error: admin.error };
  const { supabase } = admin;
  const { data, error } = await supabase.rpc(
    "admin_users_with_playbook_count"
  );
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateUserRole(
  userId: string,
  newRole: "user" | "super_admin"
) {
  const admin = await requireAdmin();
  if (admin.error) return { error: admin.error };
  const { supabase } = admin;

  // Browley Rule: prevent changing the protected account
  const { data: target } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (target?.email === PROTECTED_EMAIL) {
    return { error: "This account is protected and cannot be modified." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { error: null };
}

// --- Prompt Templates ---

export async function getPromptTemplates() {
  const admin = await requireAdmin();
  if (admin.error) return { data: null, error: admin.error };
  const { supabase } = admin;
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .order("category")
    .order("name");
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getActivePromptTemplates() {
  const admin = await requireAdmin();
  if (admin.error) return { data: null, error: admin.error };
  const { supabase } = admin;
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("name");
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function savePromptTemplate(templateId: string, content: string) {
  const admin = await requireAdmin();
  if (admin.error) return { error: admin.error, newVersion: null };
  const { supabase, userId } = admin;

  // Fetch the current active row
  const { data: current, error: fetchError } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (fetchError || !current) {
    return { error: "Template not found.", newVersion: null };
  }

  const newVersion = current.version + 1;

  // Archive current row
  const { error: archiveError } = await supabase
    .from("prompt_templates")
    .update({ is_active: false })
    .eq("id", templateId);

  if (archiveError) {
    return { error: archiveError.message, newVersion: null };
  }

  // Insert new version
  const { error: insertError } = await supabase
    .from("prompt_templates")
    .insert({
      name: current.name,
      category: current.category,
      content,
      version: newVersion,
      is_active: true,
      updated_by: userId,
    });

  if (insertError) {
    return { error: insertError.message, newVersion: null };
  }

  revalidatePath("/admin/prompts");
  return { error: null, newVersion };
}

export async function createPromptTemplate(
  name: string,
  category: string,
  content: string
) {
  const admin = await requireAdmin();
  if (admin.error) return { error: admin.error };
  const { supabase, userId } = admin;

  const { error } = await supabase!.from("prompt_templates").insert({
    name,
    category,
    content,
    version: 1,
    is_active: true,
    updated_by: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/prompts");
  return { error: null };
}

// --- Demo Features ---

export async function getDemoFeatures(industry?: string) {
  const admin = await requireAdmin();
  if (admin.error) return { data: null, error: admin.error };
  const { supabase } = admin;
  let query = supabase
    .from("demo_features")
    .select("*, prompt_templates(id, name)")
    .order("industry")
    .order("display_order");

  if (industry) {
    query = query.eq("industry", industry);
  }

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createDemoFeature(
  industry: string,
  slug: string,
  label: string,
  description: string,
  promptTemplateId: string
) {
  const admin = await requireAdmin();
  if (admin.error) return { error: admin.error };
  const { supabase } = admin;

  const { error } = await supabase.from("demo_features").insert({
    industry,
    slug,
    label,
    description,
    prompt_template_id: promptTemplateId,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/config");
  return { error: null };
}

export async function updateDemoFeature(
  id: string,
  updates: {
    label?: string;
    description?: string;
    prompt_template_id?: string;
    display_order?: number;
    is_active?: boolean;
  }
) {
  const admin = await requireAdmin();
  if (admin.error) return { error: admin.error };
  const { supabase } = admin;

  const { error } = await supabase
    .from("demo_features")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/config");
  return { error: null };
}

export async function deactivateDemoFeature(id: string) {
  return updateDemoFeature(id, { is_active: false });
}
