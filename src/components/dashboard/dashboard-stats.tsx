import type { PlaybookSummary } from "@/lib/compiler/types";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpenIcon, PencilLineIcon, CircleCheckIcon } from "lucide-react";

interface DashboardStatsProps {
  playbooks: PlaybookSummary[];
}

export function DashboardStats({ playbooks }: DashboardStatsProps) {
  const total = playbooks.length;
  const drafts = playbooks.filter((p) => p.status === "draft").length;
  const completed = playbooks.filter((p) => p.status === "completed").length;

  const stats = [
    { label: "Total Playbooks", value: total, icon: BookOpenIcon },
    { label: "Drafts", value: drafts, icon: PencilLineIcon },
    { label: "Completed", value: completed, icon: CircleCheckIcon },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
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
