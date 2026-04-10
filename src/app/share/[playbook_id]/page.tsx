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
    .select("id, customer_name, industry, status, demo_config")
    .eq("id", playbook_id)
    .eq("status", "completed")
    .single();

  if (error || !data) {
    notFound();
  }

  const playbook = data as Pick<
    PlaybookRow,
    "id" | "customer_name" | "industry" | "status" | "demo_config"
  >;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ShareScriptView playbook={playbook} />
    </div>
  );
}
