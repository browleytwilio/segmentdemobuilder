"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deletePlaybook, toggleFavorite, clonePlaybook } from "./actions";
import type { PlaybookSummary, Tag } from "@/lib/compiler/types";
import { TagManager } from "@/components/dashboard/tag-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CopyIcon,
  StarIcon,
  TrashIcon,
  MoreHorizontalIcon,
  ExternalLinkIcon,
  ClockIcon,
  BuildingIcon,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

const INDUSTRY_COLORS: Record<string, string> = {
  "E-commerce/Retail": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "B2B SaaS": "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  "FinTech": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Media & Entertainment": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export function DashboardGrid({
  playbooks,
  allTags,
  isSharedView = false,
}: {
  playbooks: PlaybookSummary[];
  allTags: Tag[];
  isSharedView?: boolean;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [togglingFav, setTogglingFav] = useState<string | null>(null);
  const [cloning, setCloning] = useState<string | null>(null);

  const sharedTracked = useRef(false);
  useEffect(() => {
    if (isSharedView && !sharedTracked.current) {
      sharedTracked.current = true;
      trackEvent("Shared Playbooks Viewed", { count: playbooks.length });
    }
  }, [isSharedView, playbooks.length]);

  async function handleDelete() {
    if (!targetId) return;
    setDeleting(targetId);
    const result = await deletePlaybook(targetId);
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Playbook Deleted", { playbook_id: targetId });
      toast.success("Playbook deleted");
    }
    setDeleting(null);
    setDialogOpen(false);
    setTargetId(null);
  }

  async function handleToggleFavorite(pb: PlaybookSummary) {
    setTogglingFav(pb.id);
    const result = await toggleFavorite(pb.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Playbook Favorited", {
        playbook_id: pb.id,
        is_favorite: !pb.is_favorite,
      });
    }
    setTogglingFav(null);
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {playbooks.map((pb) => {
          const industryColor =
            INDUSTRY_COLORS[pb.industry] ??
            "bg-muted text-muted-foreground";

          return (
            <Link
              key={pb.id}
              href={`/playbooks/${pb.id}`}
              onClick={() =>
                trackEvent("Playbook Opened", {
                  playbook_id: pb.id,
                  industry: pb.industry,
                  status: pb.status,
                })
              }
              className="group relative flex flex-col rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* Status strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${
                  pb.status === "completed"
                    ? "bg-emerald-500"
                    : "bg-amber-400"
                }`}
              />

              <div className="flex flex-col flex-1 p-4 pt-3.5">
                {/* Top row: industry badge + actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.65rem] font-medium ${industryColor}`}
                  >
                    <BuildingIcon className="size-2.5" />
                    {pb.industry}
                  </span>

                  <div className="flex items-center gap-0.5" onClick={(e) => e.preventDefault()}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleFavorite(pb);
                      }}
                      disabled={togglingFav === pb.id}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:text-yellow-500"
                    >
                      <StarIcon
                        className={`size-3.5 ${
                          pb.is_favorite ? "fill-yellow-500 text-yellow-500" : ""
                        }`}
                      />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            type="button"
                            onClick={(e) => e.preventDefault()}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.preventDefault();
                            setCloning(pb.id);
                            const result = await clonePlaybook(pb.id);
                            if (result.error) {
                              toast.error(result.error);
                            } else {
                              trackEvent("Playbook Cloned", {
                                source_playbook_id: pb.id,
                                new_playbook_id: result.id ?? "",
                                source: "dashboard",
                              });
                              toast.success("Playbook cloned");
                            }
                            setCloning(null);
                          }}
                          disabled={cloning === pb.id}
                        >
                          <CopyIcon className="size-3.5" />
                          Clone
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            setTargetId(pb.id);
                            setDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <TrashIcon className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                  {pb.customer_name || "Untitled"}
                </h3>

                {/* Shared by */}
                {isSharedView && pb.user_email && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {pb.user_email.split("@")[0]}
                  </p>
                )}

                {/* Tags */}
                {pb.tags && pb.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {pb.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium bg-secondary text-secondary-foreground"
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{
                            backgroundColor: `var(--color-${tag.color}, ${tag.color})`,
                          }}
                        />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer metadata */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ClockIcon className="size-3" />
                    <span className="text-[0.7rem]">{timeAgo(pb.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                    <TagManager
                      playbookId={pb.id}
                      appliedTags={pb.tags ?? []}
                      allTags={allTags}
                    />
                    <Badge
                      variant={pb.status === "completed" ? "default" : "outline"}
                      className="text-[0.6rem] px-1.5 py-0"
                    >
                      {pb.status === "completed" ? "Done" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Playbook</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The playbook and all its compiled
              prompts will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={!!deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!!deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
