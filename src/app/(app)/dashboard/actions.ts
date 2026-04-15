"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient, ensureProfile } from "@/lib/supabase/server";
import { createNotification } from "@/app/(app)/notifications/actions";
import type { PlaybookSummary, PlaybookRow, Tag, DemoConfig, PlaybookVisibility } from "@/lib/compiler/types";

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface PlaybookFilters {
  q?: string;
  industry?: string;
  status?: "draft" | "completed";
  sort?: "updated_at" | "created_at" | "customer_name";
  order?: "asc" | "desc";
  favorites?: boolean;
  tag_id?: string;
}

// ---------------------------------------------------------------------------
// Playbooks
// ---------------------------------------------------------------------------

export async function getPlaybooks(
  filters?: PlaybookFilters
): Promise<PlaybookSummary[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = await createClient();

  let query = supabase
    .from("playbooks")
    .select(
      "id, customer_name, industry, status, updated_at, is_favorite, playbook_tags(tag_id, tags(id, name, color))"
    )
    .eq("user_id", userId);

  if (filters?.q) {
    query = query.ilike("customer_name", `%${filters.q}%`);
  }
  if (filters?.industry) {
    query = query.eq("industry", filters.industry);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.favorites) {
    query = query.eq("is_favorite", true);
  }

  const sortCol = filters?.sort ?? "updated_at";
  const ascending = (filters?.order ?? "desc") === "asc";
  query = query.order(sortCol, { ascending });

  const { data, error } = await query;

  if (error || !data) return [];

  // Flatten the nested playbook_tags join into a tags array
  return (data as Array<Record<string, unknown>>).map((row) => {
    const pt = (row.playbook_tags ?? []) as Array<{
      tag_id: string;
      tags: Tag | Tag[] | null;
    }>;
    const tags = pt
      .map((t) => (Array.isArray(t.tags) ? t.tags[0] : t.tags))
      .filter(Boolean) as Tag[];

    return {
      id: row.id as string,
      customer_name: row.customer_name as string,
      industry: row.industry as string,
      status: row.status as "draft" | "completed",
      updated_at: row.updated_at as string,
      is_favorite: row.is_favorite as boolean,
      tags,
    };
  });
}

export async function deletePlaybook(id: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("playbooks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function getPlaybookById(
  id: string
): Promise<PlaybookRow | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbooks")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as PlaybookRow;
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export async function toggleFavorite(
  playbookId: string
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();

  const { data, error: fetchError } = await supabase
    .from("playbooks")
    .select("is_favorite")
    .eq("id", playbookId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !data) return { error: "Playbook not found" };

  const { error } = await supabase
    .from("playbooks")
    .update({ is_favorite: !data.is_favorite })
    .eq("id", playbookId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export async function getTags(): Promise<Tag[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("user_id", userId)
    .order("name");

  if (error || !data) return [];
  return data as Tag[];
}

export async function createTag(
  name: string,
  color: string
): Promise<{ id?: string; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  await ensureProfile(userId);
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) {
    return { error: "Tag name must be 1-30 characters" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: userId, name: trimmed, color })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Tag already exists" };
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { id: data.id };
}

export async function deleteTag(tagId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", tagId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function addTagToPlaybook(
  playbookId: string,
  tagId: string
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("playbook_tags")
    .insert({ playbook_id: playbookId, tag_id: tagId });

  if (error) {
    if (error.code === "23505") return {}; // Already tagged
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function removeTagFromPlaybook(
  playbookId: string,
  tagId: string
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("playbook_tags")
    .delete()
    .eq("playbook_id", playbookId)
    .eq("tag_id", tagId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

// ---------------------------------------------------------------------------
// Cloning
// ---------------------------------------------------------------------------

export async function clonePlaybook(
  playbookId: string
): Promise<{ id?: string; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  await ensureProfile(userId);
  const supabase = await createClient();

  // Fetch source playbook — allow own playbooks or completed (shared/public) ones
  const { data: source, error: fetchError } = await supabase
    .from("playbooks")
    .select("user_id, customer_name, industry, demo_config, visibility, status, generated_prompts")
    .eq("id", playbookId)
    .single();

  if (fetchError || !source) return { error: "Playbook not found" };

  // Enforce access: non-owners can only clone shared/public completed playbooks
  if (source.user_id !== userId) {
    if (source.visibility === "private" || source.status !== "completed") {
      return { error: "Playbook not found" };
    }
  }

  const { data, error } = await supabase
    .from("playbooks")
    .insert({
      user_id: userId,
      customer_name: `${source.customer_name} (copy)`,
      industry: source.industry,
      status: "draft",
      demo_config: source.demo_config as DemoConfig,
      generated_prompts: source.generated_prompts || [],
      cloned_from: playbookId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Notify source playbook owner (unless cloning own playbook)
  if (source.user_id && source.user_id !== userId) {
    createNotification(
      source.user_id,
      "clone",
      "Your playbook was cloned",
      `Someone cloned "${source.customer_name}"`,
      { playbook_id: playbookId, new_playbook_id: data.id }
    );
  }

  revalidatePath("/dashboard");
  return { id: data.id };
}

// ---------------------------------------------------------------------------
// Shared Playbooks
// ---------------------------------------------------------------------------

export async function getSharedPlaybooks(
  filters?: PlaybookFilters
): Promise<PlaybookSummary[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = await createClient();

  let query = supabase
    .from("playbooks")
    .select(
      "id, customer_name, industry, status, updated_at, is_favorite, visibility, profiles!inner(email)"
    )
    .eq("visibility", "shared");

  if (filters?.q) {
    query = query.ilike("customer_name", `%${filters.q}%`);
  }
  if (filters?.industry) {
    query = query.eq("industry", filters.industry);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const sortCol = filters?.sort ?? "updated_at";
  const ascending = (filters?.order ?? "desc") === "asc";
  query = query.order(sortCol, { ascending });

  const { data, error } = await query;

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((row) => {
    const profile = row.profiles as { email: string } | null;
    return {
      id: row.id as string,
      customer_name: row.customer_name as string,
      industry: row.industry as string,
      status: row.status as "draft" | "completed",
      updated_at: row.updated_at as string,
      is_favorite: row.is_favorite as boolean,
      visibility: row.visibility as PlaybookVisibility,
      user_email: profile?.email,
    };
  });
}

// ---------------------------------------------------------------------------
// Visibility
// ---------------------------------------------------------------------------

export async function updatePlaybookVisibility(
  playbookId: string,
  visibility: PlaybookVisibility
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("playbooks")
    .update({ visibility })
    .eq("id", playbookId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}
