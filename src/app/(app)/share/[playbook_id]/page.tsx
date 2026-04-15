import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PlaybookRow } from "@/lib/compiler/types";
import { ShareScriptView } from "./share-script-view";

export default async function SharePage({
  params,
}: {
  params: Promise<{ playbook_id: string }>;
}) {
  const { playbook_id } = await params;
  const supabase = await createClient();

  // Public access — no auth check. RLS policy allows reading completed playbooks.
  const { data, error } = await supabase
    .from("playbooks")
    .select("id, customer_name, industry, status, demo_config, visibility")
    .eq("id", playbook_id)
    .eq("status", "completed")
    .in("visibility", ["shared", "public"])
    .single();

  if (error || !data) {
    notFound();
  }

  const playbook = data as Pick<
    PlaybookRow,
    "id" | "customer_name" | "industry" | "status" | "demo_config"
  >;

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <ShareScriptView playbook={playbook} />
    </div>
  );
}
