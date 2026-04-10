"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PlaybookSummary, PlaybookRow } from "@/lib/compiler/types";

export async function getPlaybooks(): Promise<PlaybookSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("playbooks")
    .select("id, customer_name, industry, status, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return [];
  return data as PlaybookSummary[];
}

export async function deletePlaybook(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("playbooks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function getPlaybookById(
  id: string
): Promise<PlaybookRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("playbooks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return data as PlaybookRow;
}
