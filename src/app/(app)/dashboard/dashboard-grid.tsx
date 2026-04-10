"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deletePlaybook, toggleFavorite, clonePlaybook } from "./actions";
import type { PlaybookSummary, Tag } from "@/lib/compiler/types";
import { TagManager } from "@/components/dashboard/tag-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CopyIcon, StarIcon, TrashIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playbooks.map((pb) => (
          <Card key={pb.id} className="flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  {pb.customer_name || "Untitled"}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(pb)}
                    disabled={togglingFav === pb.id}
                    className="rounded p-0.5 text-muted-foreground transition-colors hover:text-yellow-500"
                  >
                    <StarIcon
                      className={`size-4 ${
                        pb.is_favorite
                          ? "fill-yellow-500 text-yellow-500"
                          : ""
                      }`}
                    />
                  </button>
                  <Badge
                    variant={pb.status === "completed" ? "default" : "outline"}
                  >
                    {pb.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {pb.industry}
                {isSharedView && pb.user_email && (
                  <span className="block text-xs text-muted-foreground/70 mt-0.5">
                    by {pb.user_email.split("@")[0]}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Updated {formatDate(pb.updated_at)}
              </p>
              {pb.tags && pb.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pb.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium bg-secondary text-secondary-foreground"
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
            </CardContent>
            <CardFooter className="gap-2">
              <Link
                href={`/playbooks/${pb.id}`}
                className="inline-flex h-7 flex-1 items-center justify-center rounded-lg bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground"
                onClick={() =>
                  trackEvent("Playbook Opened", {
                    playbook_id: pb.id,
                    industry: pb.industry,
                    status: pb.status,
                  })
                }
              >
                View
              </Link>
              <Button
                size="sm"
                variant="ghost"
                disabled={cloning === pb.id}
                onClick={async () => {
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
              >
                <CopyIcon className="size-4" />
              </Button>
              <TagManager
                playbookId={pb.id}
                appliedTags={pb.tags ?? []}
                allTags={allTags}
              />
              <Button
                size="sm"
                variant="ghost"
                disabled={deleting === pb.id}
                onClick={() => {
                  setTargetId(pb.id);
                  setDialogOpen(true);
                }}
              >
                <TrashIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
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
