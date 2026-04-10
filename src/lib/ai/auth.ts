import { auth } from "@clerk/nextjs/server";

export async function requireAuthForAI(): Promise<
  | { userId: string; error: null }
  | { userId: null; error: string }
> {
  const { userId } = await auth();
  if (!userId) return { userId: null, error: "Not authenticated" };
  return { userId, error: null };
}
