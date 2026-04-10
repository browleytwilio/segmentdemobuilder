"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current user's role from the profiles table.
 * Used by AnalyticsProvider to include role in identify() calls.
 */
export async function getMyRole(): Promise<"user" | "super_admin" | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return (data?.role as "user" | "super_admin") ?? null;
}
