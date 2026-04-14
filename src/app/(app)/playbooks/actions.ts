"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/app/(app)/notifications/actions";
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

  // Notify playbook owner (unless they're the commenter)
  const { data: playbook } = await supabase
    .from("playbooks")
    .select("user_id, customer_name")
    .eq("id", playbookId)
    .single();

  if (playbook && playbook.user_id !== userId) {
    createNotification(
      playbook.user_id,
      "comment",
      "New comment on your playbook",
      `Someone commented on "${playbook.customer_name}"`,
      { playbook_id: playbookId }
    );
  }

  revalidatePath(`/playbooks/${playbookId}`);
  return {};
}

export async function updatePlaybookPrompt(
  playbookId: string,
  stepNumber: number,
  updatedPrompt: { stepNumber: number; title: string; promptText: string; expectedOutput: string }
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();

  // Fetch current prompts
  const { data, error: fetchError } = await supabase
    .from("playbooks")
    .select("generated_prompts")
    .eq("id", playbookId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !data) return { error: "Playbook not found" };

  const prompts = data.generated_prompts as Array<Record<string, unknown>>;
  const updated = prompts.map((p) =>
    (p.stepNumber as number) === stepNumber ? updatedPrompt : p
  );

  const { error } = await supabase
    .from("playbooks")
    .update({ generated_prompts: updated })
    .eq("id", playbookId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/playbooks/${playbookId}`);
  return {};
}

export async function updatePlaybookProgress(
  playbookId: string,
  completedSteps: number[]
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("playbooks")
    .update({ progress: completedSteps })
    .eq("id", playbookId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
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
