import { Suspense } from "react";
import Link from "next/link";
import { getPlaybooks, getSharedPlaybooks, getTags } from "./actions";
import { DashboardGrid } from "./dashboard-grid";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { BookOpenIcon } from "lucide-react";
import { NewPlaybookButton } from "./new-playbook-button";
import type { PlaybookFilters } from "./actions";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseFilters(
  raw: Record<string, string | string[] | undefined>
): PlaybookFilters {
  const str = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined;

  return {
    q: str(raw.q),
    industry: str(raw.industry),
    status: str(raw.status) as PlaybookFilters["status"],
    sort: str(raw.sort) as PlaybookFilters["sort"],
    order: str(raw.order) as PlaybookFilters["order"],
    favorites: raw.favorites === "true",
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const rawParams = await searchParams;
  const filters = parseFilters(rawParams);
  const activeTab = rawParams.tab === "shared" ? "shared" as const : "mine" as const;

  const [playbooks, allTags] = await Promise.all([
    activeTab === "shared"
      ? getSharedPlaybooks(filters)
      : getPlaybooks(filters),
    getTags(),
  ]);

  const isFiltered = Object.entries(filters).some(
    ([, v]) => v !== undefined && v !== false
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Manage your demo playbooks"
        action={<NewPlaybookButton location="header" />}
      />

      {activeTab === "mine" && <DashboardStats playbooks={playbooks} />}

      <Suspense>
        <div className="flex flex-wrap items-center gap-4">
          <DashboardTabs activeTab={activeTab} />
          <div className="flex-1">
            <DashboardFilters />
          </div>
        </div>
      </Suspense>

      {playbooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border py-16 text-center space-y-3">
          <BookOpenIcon className="size-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">
              {isFiltered
                ? "No playbooks match your filters"
                : activeTab === "shared"
                  ? "No shared playbooks yet"
                  : "No playbooks yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isFiltered
                ? "Try adjusting your filters or search query."
                : activeTab === "shared"
                  ? "When colleagues share their playbooks, they'll appear here."
                  : "Create your first playbook to get started."}
            </p>
          </div>
          {!isFiltered && activeTab === "mine" && (
            <NewPlaybookButton location="empty_state" variant="outline" />
          )}
        </div>
      ) : (
        <DashboardGrid
          playbooks={playbooks}
          allTags={allTags}
          isSharedView={activeTab === "shared"}
        />
      )}
    </div>
  );
}
