"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { trackEvent } from "@/lib/analytics/events";
import { UserIcon, UsersIcon } from "lucide-react";

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

  const tabs = [
    { key: "mine" as const, label: "My Playbooks", icon: UserIcon },
    { key: "shared" as const, label: "Shared", icon: UsersIcon },
  ];

  return (
    <div className="flex rounded-lg border bg-muted/50 p-0.5 w-fit">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => switchTab(key)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            activeTab === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
