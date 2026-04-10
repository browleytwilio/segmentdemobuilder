"use client";

import { useEffect, useRef } from "react";
import type { PlaybookSummary } from "@/lib/compiler/types";
import { trackEvent } from "@/lib/analytics/events";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const stats = [
    { label: "Total Playbooks", value: total, icon: BookOpenIcon },
    { label: "Drafts", value: drafts, icon: PencilLineIcon },
    { label: "Completed", value: completed, icon: CircleCheckIcon },
    { label: "Favorites", value: favorites, icon: StarIcon },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} data-size="sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
