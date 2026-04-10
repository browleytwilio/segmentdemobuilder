import Link from "next/link";
import { getPlaybooks } from "./actions";
import { DashboardGrid } from "./dashboard-grid";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { BookOpenIcon } from "lucide-react";

export default async function DashboardPage() {
  const playbooks = await getPlaybooks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Manage your demo playbooks"
        action={
          <Button render={<Link href="/builder" />}>New Playbook</Button>
        }
      />

      <DashboardStats playbooks={playbooks} />

      {playbooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border py-16 text-center space-y-3">
          <BookOpenIcon className="size-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">No playbooks yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first playbook to get started.
            </p>
          </div>
          <Button variant="outline" render={<Link href="/builder" />}>
            Create Playbook
          </Button>
        </div>
      ) : (
        <DashboardGrid playbooks={playbooks} />
      )}
    </div>
  );
}
