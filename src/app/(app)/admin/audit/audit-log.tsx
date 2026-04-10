"use client";

import type { AuditLogEntry } from "../actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
  entries: AuditLogEntry[];
  error: string | null;
}

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  role_change:                 { label: "Role Change",        variant: "default" },
  template_save:               { label: "Template Saved",     variant: "secondary" },
  template_create:             { label: "Template Created",   variant: "secondary" },
  feature_create:              { label: "Feature Created",    variant: "secondary" },
  feature_update:              { label: "Feature Updated",    variant: "outline" },
  feature_toggle:              { label: "Feature Toggled",    variant: "outline" },
  playbook_delete:             { label: "Playbook Deleted",   variant: "destructive" },
  playbook_visibility_change:  { label: "Visibility Changed", variant: "outline" },
};

const TARGET_LABELS: Record<string, string> = {
  user:            "User",
  prompt_template: "Prompt Template",
  demo_feature:    "Demo Feature",
  playbook:        "Playbook",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DetailsCell({ details }: { details: Record<string, unknown> }) {
  const entries = Object.entries(details).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
      {entries.map(([k, v]) => (
        <span key={k} className="text-xs">
          <span className="text-muted-foreground">{k}: </span>
          <span>{String(v)}</span>
        </span>
      ))}
    </div>
  );
}

export function AuditLog({ entries, error }: Props) {
  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load audit log: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {entries.length} entr{entries.length !== 1 ? "ies" : "y"} (most recent first)
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const actionMeta = ACTION_LABELS[entry.action] ?? { label: entry.action, variant: "outline" as const };
            return (
              <TableRow key={entry.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(entry.created_at)}
                </TableCell>
                <TableCell className="text-sm max-w-[160px] truncate">
                  {entry.admin_email ?? entry.admin_id}
                </TableCell>
                <TableCell>
                  <Badge variant={actionMeta.variant}>{actionMeta.label}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="text-muted-foreground">
                    {TARGET_LABELS[entry.target_type] ?? entry.target_type}
                  </span>
                  {entry.target_id && (
                    <span className="ml-1 font-mono text-xs text-muted-foreground/60">
                      {entry.target_id.length > 12
                        ? `…${entry.target_id.slice(-8)}`
                        : entry.target_id}
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs">
                  <DetailsCell details={entry.details} />
                </TableCell>
              </TableRow>
            );
          })}
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                No audit entries yet. Admin actions will appear here.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
