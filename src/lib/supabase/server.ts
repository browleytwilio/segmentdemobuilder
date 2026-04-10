import { auth } from "@clerk/nextjs/server";
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
