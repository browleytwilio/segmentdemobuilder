import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function requireAuthForAI(): Promise<{
  user: User;
  error: null;
} | {
  user: null;
  error: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, error: "Not authenticated" };
  return { user, error: null };
}
