"use client";

import type { AnalyticsStats } from "../actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: AnalyticsStats | null;
  error: string | null;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AnalyticsDashboard({ data, error }: Props) {
  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load analytics: {error}
      </div>
    );
  }

  if (!data) return null;

  const totalPlaybooks = data.total_playbooks || 1;
  const industries = Object.entries(data.playbooks_by_industry).sort(
    ([, a], [, b]) => b - a
  );
  const statuses = Object.entries(data.playbooks_by_status);

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Users" value={data.total_users} />
        <StatCard label="Total Playbooks" value={data.total_playbooks} />
        <StatCard label="New This Week" value={data.playbooks_this_week} />
        <StatCard label="Active This Month" value={data.active_users_this_month} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Industry Breakdown */}
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-sm">Playbooks by Industry</h2>
          </div>
          {industries.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Industry</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="w-32">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {industries.map(([industry, count]) => (
                  <TableRow key={industry}>
                    <TableCell className="capitalize">{industry}</TableCell>
                    <TableCell className="text-right tabular-nums">{count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round((count / totalPlaybooks) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                          {Math.round((count / totalPlaybooks) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-sm">Playbooks by Status</h2>
          </div>
          {statuses.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="w-32">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map(([status, count]) => (
                  <TableRow key={status}>
                    <TableCell className="capitalize">{status}</TableCell>
                    <TableCell className="text-right tabular-nums">{count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round((count / totalPlaybooks) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                          {Math.round((count / totalPlaybooks) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Top Scenarios */}
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-sm">Top Scenarios Used</h2>
          </div>
          {data.top_scenarios.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No scenario data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead className="text-right">Uses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.top_scenarios.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{s.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Recent Signups */}
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-sm">Recent Signups</h2>
          </div>
          {data.recent_signups.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Playbooks</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recent_signups.map((u) => (
                  <TableRow key={u.email}>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell className="text-right tabular-nums">{u.playbook_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(u.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
