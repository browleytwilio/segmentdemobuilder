import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/components/app/motion-wrappers";
import { ProfileCard } from "./profile-card";

export const metadata = {
  title: "Profile | Segment Demo Builder",
};

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, supabase] = await Promise.all([currentUser(), createClient()]);
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const { count: playbookCount } = await supabase
    .from("playbooks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: completedCount } = await supabase
    .from("playbooks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details and usage.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
      <ProfileCard
        fullName={user.fullName ?? user.firstName ?? ""}
        email={user.primaryEmailAddress?.emailAddress ?? ""}
        imageUrl={user.imageUrl}
        role={profile?.role ?? "user"}
        memberSince={user.createdAt ? new Date(user.createdAt).toISOString() : ""}
        playbookCount={playbookCount ?? 0}
        completedCount={completedCount ?? 0}
      />
      </FadeIn>
    </div>
  );
}
