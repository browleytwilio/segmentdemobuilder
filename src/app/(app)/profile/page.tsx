import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient, ensureProfile } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
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

  await ensureProfile(userId);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

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
    <div className="p-4 sm:p-6 max-w-3xl">
      <FadeIn>
        <PageHeader
          title="Profile"
          description="Your account details and usage."
        />
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
