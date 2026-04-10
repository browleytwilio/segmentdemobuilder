"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { trackEvent } from "@/lib/analytics/events";

interface DashboardTabsProps {
  activeTab: "mine" | "shared";
}

export function DashboardTabs({ activeTab }: DashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchTab = useCallback(
    (tab: "mine" | "shared") => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "mine") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      router.push(qs ? `/dashboard?${qs}` : "/dashboard");
      trackEvent("Dashboard Tab Switched", { tab });
    },
    [router, searchParams]
  );

  return (
    <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-1 w-fit">
      <button
        type="button"
        onClick={() => switchTab("mine")}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
          activeTab === "mine"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        My Playbooks
      </button>
      <button
        type="button"
        onClick={() => switchTab("shared")}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
          activeTab === "shared"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Shared
      </button>
    </div>
  );
}
