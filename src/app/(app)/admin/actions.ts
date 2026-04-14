"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/app/(app)/notifications/actions";
import type { PlaybookVisibility } from "@/lib/compiler/types";

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

async function insertAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  adminId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  details: Record<string, unknown>
) {
  // Best-effort — never throw on audit failure
  try {
    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch {
    // intentionally silent
  }
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
  const { supabase, userId: adminId } = admin;

  // Browley Rule: prevent changing the protected account
  const { data: target } = await supabase
    .from("profiles")
    .select("email, role")
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

  await insertAuditLog(supabase, adminId!, "role_change", "user", userId, {
    email: target?.email,
    old_role: target?.role,
    new_role: newRole,
  });

  // Notify the affected user about their role change
  createNotification(
    userId,
    "role_change",
    `Your role has been updated`,
    `Your role has been changed to ${newRole === "super_admin" ? "Super Admin" : "User"}.`,
    { new_role: newRole, old_role: target?.role }
  );

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

  const { data: current, error: fetchError } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (fetchError || !current) {
    return { error: "Template not found.", newVersion: null };
  }

  const newVersion = current.version + 1;

  const { error: archiveError } = await supabase
    .from("prompt_templates")
    .update({ is_active: false })
    .eq("id", templateId);

  if (archiveError) {
    return { error: archiveError.message, newVersion: null };
  }

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

  await insertAuditLog(supabase, userId!, "template_save", "prompt_template", templateId, {
    name: current.name,
    old_version: current.version,
    new_version: newVersion,
  });

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

  const { data: inserted, error } = await supabase
    .from("prompt_templates")
    .insert({
      name,
      category,
      content,
      version: 1,
      is_active: true,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await insertAuditLog(supabase, userId!, "template_create", "prompt_template", inserted?.id ?? null, {
    name,
    category,
  });

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
  const { supabase, userId } = admin;

  const { error } = await supabase.from("demo_features").insert({
    industry,
    slug,
    label,
    description,
    prompt_template_id: promptTemplateId,
  });

  if (error) return { error: error.message };

  await insertAuditLog(supabase, userId!, "feature_create", "demo_feature", slug, {
    industry,
    slug,
    label,
  });

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
  const { supabase, userId } = admin;

  const { error } = await supabase
    .from("demo_features")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  const action = updates.is_active !== undefined ? "feature_toggle" : "feature_update";
  await insertAuditLog(supabase, userId!, action, "demo_feature", id, { changes: updates });

  revalidatePath("/admin/config");
  return { error: null };
}

export async function deactivateDemoFeature(id: string) {
  return updateDemoFeature(id, { is_active: false });
}

// --- Analytics ---

export interface AnalyticsStats {
  total_users: number;
  total_playbooks: number;
  playbooks_this_week: number;
  active_users_this_month: number;
  playbooks_by_industry: Record<string, number>;
  playbooks_by_status: Record<string, number>;
  top_scenarios: { id: string; label: string; count: number }[];
  recent_signups: { email: string; created_at: string; playbook_count: number }[];
}

export async function getAnalyticsStats(): Promise<{ data: AnalyticsStats | null; error: string | null }> {
  const admin = await requireAdmin();
  if (admin.error) return { data: null, error: admin.error };
  const { supabase } = admin;

  const { data, error } = await supabase.rpc("admin_analytics_stats");
  if (error) return { data: null, error: error.message };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { data: null, error: "No data returned" };

  return {
    data: {
      total_users: Number(row.total_users ?? 0),
      total_playbooks: Number(row.total_playbooks ?? 0),
      playbooks_this_week: Number(row.playbooks_this_week ?? 0),
      active_users_this_month: Number(row.active_users_this_month ?? 0),
      playbooks_by_industry: (row.playbooks_by_industry as Record<string, number>) ?? {},
      playbooks_by_status: (row.playbooks_by_status as Record<string, number>) ?? {},
      top_scenarios: (row.top_scenarios as { id: string; label: string; count: number }[]) ?? [],
      recent_signups: (row.recent_signups as { email: string; created_at: string; playbook_count: number }[]) ?? [],
    },
    error: null,
  };
}

// --- Global Playbook Management ---

export interface AdminPlaybook {
  id: string;
  customer_name: string;
  industry: string;
  status: "draft" | "completed";
  visibility: PlaybookVisibility;
  user_id: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  total_count: number;
}

export async function getAdminPlaybooks(filters?: {
  industry?: string;
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: AdminPlaybook[]; total: number; error: string | null }> {
  const admin = await requireAdmin();
  if (admin.error) return { data: [], total: 0, error: admin.error };
  const { supabase } = admin;

  const { data, error } = await supabase.rpc("admin_all_playbooks", {
    p_limit: filters?.limit ?? 50,
    p_offset: filters?.offset ?? 0,
    p_industry: filters?.industry ?? null,
    p_status: filters?.status ?? null,
    p_q: filters?.q ?? null,
  });

  if (error) return { data: [], total: 0, error: error.message };

  const rows = (data ?? []) as AdminPlaybook[];
  const total = rows[0]?.total_count ?? 0;
  return { data: rows, total: Number(total), error: null };
}

export async function adminDeletePlaybook(playbookId: string): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (admin.error) return { error: admin.error };
  const { supabase, userId } = admin;

  // Fetch for audit details before deleting
  const { data: playbook } = await supabase
    .from("playbooks")
    .select("customer_name, user_id, profiles!inner(email)")
    .eq("id", playbookId)
    .single();

  const { error } = await supabase
    .from("playbooks")
    .delete()
    .eq("id", playbookId);

  if (error) return { error: error.message };

  const profile = playbook?.profiles as { email?: string } | null;
  await insertAuditLog(supabase, userId!, "playbook_delete", "playbook", playbookId, {
    customer_name: playbook?.customer_name,
    owner_email: profile?.email,
  });

  revalidatePath("/admin/playbooks");
  return { error: null };
}

export async function adminUpdatePlaybookVisibility(
  playbookId: string,
  visibility: PlaybookVisibility
): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (admin.error) return { error: admin.error };
  const { supabase, userId } = admin;

  // Fetch owner email for audit
  const { data: playbook } = await supabase
    .from("playbooks")
    .select("customer_name, visibility, profiles!inner(email)")
    .eq("id", playbookId)
    .single();

  const { error } = await supabase
    .from("playbooks")
    .update({ visibility })
    .eq("id", playbookId);

  if (error) return { error: error.message };

  const profile = playbook?.profiles as { email?: string } | null;
  await insertAuditLog(supabase, userId!, "playbook_visibility_change", "playbook", playbookId, {
    customer_name: playbook?.customer_name,
    owner_email: profile?.email,
    old_visibility: playbook?.visibility,
    new_visibility: visibility,
  });

  revalidatePath("/admin/playbooks");
  return { error: null };
}

// --- Audit Log ---

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_email?: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export async function getAuditLog(limit = 100): Promise<{ data: AuditLogEntry[]; error: string | null }> {
  const admin = await requireAdmin();
  if (admin.error) return { data: [], error: admin.error };
  const { supabase } = admin;

  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("*, profiles!inner(email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { data: [], error: error.message };

  const entries = (data ?? []).map((row) => {
    const profile = row.profiles as { email?: string } | null;
    return {
      id: row.id as string,
      admin_id: row.admin_id as string,
      admin_email: profile?.email,
      action: row.action as string,
      target_type: row.target_type as string,
      target_id: row.target_id as string | null,
      details: (row.details as Record<string, unknown>) ?? {},
      created_at: row.created_at as string,
    };
  });

  return { data: entries, error: null };
}
