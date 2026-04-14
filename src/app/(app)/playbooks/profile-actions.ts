"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getUserTraits,
  getUserAudiences,
  getUserEvents,
  type ProfileTraits,
  type ProfileAudiences,
} from "@/lib/segment/profile-api";

export interface ProfileData {
  traits: ProfileTraits;
  audiences: ProfileAudiences;
  events: Record<string, unknown>[];
}

export async function fetchProfileData(
  identifier: string
): Promise<{ data?: ProfileData; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const trimmed = identifier.trim();
  if (!trimmed) return { error: "Identifier is required" };

  // Ensure identifier has a prefix (user_id:, email:, anonymous_id:)
  const hasPrefix = /^(user_id|email|anonymous_id):/.test(trimmed);
  const resolved = hasPrefix ? trimmed : `user_id:${trimmed}`;

  try {
    const [traits, audiences, events] = await Promise.all([
      getUserTraits(resolved),
      getUserAudiences(resolved),
      getUserEvents(resolved, 10),
    ]);

    return { data: { traits, audiences, events } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Profile API request failed";
    return { error: message };
  }
}
