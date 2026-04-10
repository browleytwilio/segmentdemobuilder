"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import type { PlaybookComment } from "@/lib/compiler/types";

export async function getPlaybookComments(
  playbookId: string
): Promise<PlaybookComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbook_comments")
    .select("id, playbook_id, user_id, content, created_at, updated_at, profiles(email)")
    .eq("playbook_id", playbookId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((row) => {
    const profile = row.profiles as { email: string } | null;
    return {
      id: row.id as string,
      playbook_id: row.playbook_id as string,
      user_id: row.user_id as string,
      user_email: profile?.email,
      content: row.content as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  });
}

export async function addComment(
  playbookId: string,
  content: string
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 2000) {
    return { error: "Comment must be 1-2000 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("playbook_comments")
    .insert({
      playbook_id: playbookId,
      user_id: userId,
      content: trimmed,
    });

  if (error) return { error: error.message };

  revalidatePath(`/playbooks/${playbookId}`);
  return {};
}

export async function deleteComment(
  commentId: string,
  playbookId: string
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("playbook_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/playbooks/${playbookId}`);
  return {};
}
