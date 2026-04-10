"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deletePlaybook } from "./actions";
import type { PlaybookSummary } from "@/lib/compiler/types";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardGrid({
  playbooks,
}: {
  playbooks: PlaybookSummary[];
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  async function handleDelete() {
    if (!targetId) return;
    setDeleting(targetId);
    const result = await deletePlaybook(targetId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Playbook deleted");
    }
    setDeleting(null);
    setDialogOpen(false);
    setTargetId(null);
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
                <Badge
                  variant={pb.status === "completed" ? "default" : "outline"}
                >
                  {pb.status}
                </Badge>
              </div>
              <CardDescription>{pb.industry}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Updated {formatDate(pb.updated_at)}
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Link
                href={`/playbooks/${pb.id}`}
                className="inline-flex h-7 flex-1 items-center justify-center rounded-lg bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground"
              >
                View
              </Link>
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
