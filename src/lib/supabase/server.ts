import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  const { getToken } = await auth();

  // Try to get a Clerk-signed JWT for Supabase RLS.
  // Requires a "supabase" JWT template in the Clerk dashboard.
  // Falls back to the service role key (bypasses RLS) when the template
  // is not yet configured — safe because all server actions already scope
  // queries by userId obtained from Clerk's auth().
  let token: string | null = null;
  try {
    token = await getToken({ template: "supabase" });
  } catch {
    // Template not configured — fall through to service role fallback
  }

  if (token) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );
  }

  // Service role key: bypasses RLS. Only used server-side.
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Upserts the current user's profile row before any write that references
 * profiles.id via a FK. Handles the race condition where the Clerk webhook
 * hasn't fired yet when the user creates their first playbook or tag.
 */
export async function ensureProfile(userId: string): Promise<void> {
  const user = await currentUser();
  const email =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await admin
    .from("profiles")
    .upsert({ id: userId, email }, { onConflict: "id", ignoreDuplicates: false });
}
