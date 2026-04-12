"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current user's role from the profiles table.
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

/**
 * Update the current user's name via the Clerk Backend API.
 */
export async function updateMyName(
  firstName: string,
  lastName: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  try {
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, { firstName, lastName });
    return { success: true };
  } catch (err: unknown) {
    const msg =
      (err as { errors?: Array<{ longMessage?: string }> })?.errors?.[0]
        ?.longMessage ?? "Failed to update name.";
    return { success: false, error: msg };
  }
}

/**
 * Get connected OAuth accounts for the current user.
 */
export async function getMyConnectedAccounts(): Promise<
  { provider: string; email: string }[]
> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    return user.externalAccounts.map((a) => ({
      provider: a.provider ?? "unknown",
      email: a.emailAddress ?? "",
    }));
  } catch {
    return [];
  }
}
