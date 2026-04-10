import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Segment Demo Builder
        </h1>
        <p className="text-lg text-muted-foreground">
          Build personalized Segment CDP demo playbooks for your prospects — in
          minutes, not hours.
        </p>
        <div className="flex justify-center">
          <Button size="lg" render={<Link href="/login" />}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
