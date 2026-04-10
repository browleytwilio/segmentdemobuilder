"use client";

import { useEffect, useRef } from "react";
import type { PlaybookSummary } from "@/lib/compiler/types";
import { trackEvent } from "@/lib/analytics/events";
import { BookOpenIcon, PencilLineIcon, CircleCheckIcon, StarIcon } from "lucide-react";

interface DashboardStatsProps {
  playbooks: PlaybookSummary[];
}

export function DashboardStats({ playbooks }: DashboardStatsProps) {
  const total = playbooks.length;
  const drafts = playbooks.filter((p) => p.status === "draft").length;
  const completed = playbooks.filter((p) => p.status === "completed").length;
  const favorites = playbooks.filter((p) => p.is_favorite).length;
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("Dashboard Viewed", {
      total_playbooks: total,
      drafts,
      completed,
    });
  }, [total, drafts, completed]);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      label: "Total Playbooks",
      value: total,
      icon: BookOpenIcon,
      accent: "text-foreground",
      bgAccent: "bg-primary/5 dark:bg-primary/10",
      iconColor: "text-primary/70",
    },
    {
      label: "In Progress",
      value: drafts,
      icon: PencilLineIcon,
      accent: "text-amber-600 dark:text-amber-400",
      bgAccent: "bg-amber-500/5 dark:bg-amber-500/10",
      iconColor: "text-amber-500/70",
    },
    {
      label: "Completed",
      value: completed,
      icon: CircleCheckIcon,
      accent: "text-emerald-600 dark:text-emerald-400",
      bgAccent: "bg-emerald-500/5 dark:bg-emerald-500/10",
      iconColor: "text-emerald-500/70",
      subtitle: total > 0 ? `${completionRate}% rate` : undefined,
    },
    {
      label: "Favorites",
      value: favorites,
      icon: StarIcon,
      accent: "text-yellow-600 dark:text-yellow-400",
      bgAccent: "bg-yellow-500/5 dark:bg-yellow-500/10",
      iconColor: "text-yellow-500/70",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, accent, bgAccent, iconColor, subtitle }) => (
        <div
          key={label}
          className={`relative overflow-hidden rounded-xl border p-4 ${bgAccent}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <div className={`rounded-lg p-1.5 ${bgAccent}`}>
              <Icon className={`size-3.5 ${iconColor}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold tabular-nums tracking-tight ${accent}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
