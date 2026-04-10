"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { adminDeletePlaybook, adminUpdatePlaybookVisibility } from "../actions";
import type { AdminPlaybook } from "../actions";
import { trackEvent } from "@/lib/analytics/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2Icon, EyeIcon, MoreHorizontalIcon, ExternalLinkIcon } from "lucide-react";
import type { PlaybookVisibility } from "@/lib/compiler/types";

interface Props {
  playbooks: AdminPlaybook[];
  total: number;
  error: string | null;
}

const INDUSTRIES = ["e-commerce", "b2b-saas", "fintech", "media-entertainment"];
const VISIBILITY_LABELS: Record<PlaybookVisibility, string> = {
  private: "Private",
  shared: "Shared",
  public: "Public",
};
const VISIBILITY_CYCLE: Record<PlaybookVisibility, PlaybookVisibility> = {
  private: "shared",
  shared: "public",
  public: "private",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PlaybooksTable({ playbooks, total, error }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminPlaybook | null>(null);
  const [updatingVisibility, setUpdatingVisibility] = useState<string | null>(null);

  const currentQ = searchParams.get("q") ?? "";
  const currentIndustry = searchParams.get("industry") ?? "";
  const currentStatus = searchParams.get("status") ?? "";

  function applyFilter(key: "industry" | "status" | "q", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("offset");
    if (value) {
      trackEvent("Admin Playbooks Filtered", { filter_type: key, filter_value: value });
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleDelete(playbook: AdminPlaybook) {
    setDeleting(playbook.id);
    const result = await adminDeletePlaybook(playbook.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Admin Playbook Deleted", {
        playbook_id: playbook.id,
        customer_name: playbook.customer_name,
        owner_email: playbook.user_email,
      });
      toast.success("Playbook deleted");
    }
    setDeleting(null);
    setConfirmTarget(null);
  }

  async function handleVisibilityChange(playbook: AdminPlaybook, visibility: PlaybookVisibility) {
    setUpdatingVisibility(playbook.id);
    const result = await adminUpdatePlaybookVisibility(playbook.id, visibility);
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Admin Playbook Visibility Changed", {
        playbook_id: playbook.id,
        visibility,
        owner_email: playbook.user_email,
      });
      toast.success("Visibility updated");
    }
    setUpdatingVisibility(null);
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load playbooks: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search customer name…"
          defaultValue={currentQ}
          className="h-9 w-56"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyFilter("q", (e.target as HTMLInputElement).value);
            }
          }}
          onBlur={(e) => applyFilter("q", e.target.value)}
        />

        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={currentIndustry}
          onChange={(e) => applyFilter("industry", e.target.value)}
        >
          <option value="">All industries</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={currentStatus}
          onChange={(e) => applyFilter("status", e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>

        <p className="ml-auto text-sm text-muted-foreground">
          {total} playbook{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playbooks.map((pb) => (
            <TableRow key={pb.id}>
              <TableCell className="font-medium max-w-[160px] truncate">
                {pb.customer_name}
              </TableCell>
              <TableCell className="capitalize text-sm">{pb.industry}</TableCell>
              <TableCell>
                <Badge variant={pb.status === "completed" ? "default" : "secondary"}>
                  {pb.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{VISIBILITY_LABELS[pb.visibility]}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                {pb.user_email}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(pb.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={deleting === pb.id || updatingVisibility === pb.id}
                      />
                    }
                  >
                    <MoreHorizontalIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {pb.status === "completed" && (
                      <DropdownMenuItem
                        render={
                          <Link href={`/playbooks/${pb.id}`} target="_blank" />
                        }
                        onClick={() =>
                          trackEvent("Admin Playbook Opened", {
                            playbook_id: pb.id,
                            industry: pb.industry,
                            owner_email: pb.user_email,
                          })
                        }
                      >
                        <ExternalLinkIcon className="size-4" />
                        View playbook
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={updatingVisibility === pb.id}
                      onClick={() =>
                        handleVisibilityChange(pb, VISIBILITY_CYCLE[pb.visibility])
                      }
                    >
                      <EyeIcon className="size-4" />
                      Set {VISIBILITY_LABELS[VISIBILITY_CYCLE[pb.visibility]]}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setConfirmTarget(pb)}
                    >
                      <Trash2Icon className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {playbooks.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                No playbooks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmTarget} onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete playbook?</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <strong>{confirmTarget?.customer_name}</strong> owned by{" "}
              <strong>{confirmTarget?.user_email}</strong>. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting === confirmTarget?.id}
              onClick={() => confirmTarget && handleDelete(confirmTarget)}
            >
              {deleting === confirmTarget?.id ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
