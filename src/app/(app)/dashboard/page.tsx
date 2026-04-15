import { Suspense } from "react";
import { getPlaybooks, getSharedPlaybooks, getTags } from "./actions";
import { DashboardGrid } from "./dashboard-grid";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { WelcomeDialog } from "@/components/dashboard/welcome-dialog";
import { PageHeader } from "@/components/page-header";
import { FadeIn } from "@/components/app/motion-wrappers";
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
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
      <WelcomeDialog hasPlaybooks={playbooks.length > 0} />

      {/* Header */}
      <FadeIn>
        <PageHeader
          title="Dashboard"
          description={
            playbooks.length > 0
              ? `${playbooks.length} playbook${playbooks.length !== 1 ? "s" : ""}`
              : "Manage your demo playbooks"
          }
          action={<NewPlaybookButton location="header" />}
        />
      </FadeIn>

      {/* Stats */}
      {activeTab === "mine" && (
        <FadeIn delay={0.05}>
          <DashboardStats playbooks={playbooks} />
        </FadeIn>
      )}

      {/* Tabs + Filters */}
      <FadeIn delay={0.1}>
        <Suspense>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <DashboardTabs activeTab={activeTab} />
              <div className="flex-1 min-w-0">
                <DashboardFilters />
              </div>
            </div>
          </div>
        </Suspense>
      </FadeIn>

      {/* Content */}
      <FadeIn delay={0.15}>
      {playbooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center space-y-4">
          <div className="rounded-full bg-app-accent-subtle p-5 ring-1 ring-app-accent/10">
            <BookOpenIcon className="size-10 text-app-accent/60" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="font-semibold text-lg">
              {isFiltered
                ? "No matching playbooks"
                : activeTab === "shared"
                  ? "No shared playbooks yet"
                  : "Create your first playbook"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isFiltered
                ? "Try adjusting your filters or search query to find what you're looking for."
                : activeTab === "shared"
                  ? "When colleagues share their playbooks, they'll appear here for you to view and clone."
                  : "Get started by creating a new demo playbook. Use the wizard, describe with AI, or pick a template."}
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
      </FadeIn>
    </div>
  );
}
