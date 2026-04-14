"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export async function getNotifications(limit = 20): Promise<Notification[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, metadata, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(
  notificationId: string
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return {};
}

export async function markAllAsRead(): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) return { error: error.message };
  return {};
}

/** Insert a notification for a target user. Called from server actions. */
export async function createNotification(
  targetUserId: string,
  type: string,
  title: string,
  body: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .insert({ user_id: targetUserId, type, title, body, metadata });
}
