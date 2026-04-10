"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addComment, deleteComment } from "@/app/(app)/playbooks/actions";
import type { PlaybookComment } from "@/lib/compiler/types";
import { Button } from "@/components/ui/button";
import { Loader2Icon, MessageCircleIcon, TrashIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

interface CommentThreadProps {
  playbookId: string;
  comments: PlaybookComment[];
  currentUserId: string | null;
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(email?: string) {
  if (!email) return "?";
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export function CommentThread({
  playbookId,
  comments,
  currentUserId,
}: CommentThreadProps) {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    const result = await addComment(playbookId, content);
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Comment Added", {
        playbook_id: playbookId,
        comment_length: content.trim().length,
      });
      setContent("");
    }
    setPosting(false);
  }

  async function handleDelete(comment: PlaybookComment) {
    setDeletingId(comment.id);
    const result = await deleteComment(comment.id, playbookId);
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Comment Deleted", {
        playbook_id: playbookId,
        comment_id: comment.id,
      });
    }
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircleIcon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">
          Comments ({comments.length})
        </h3>
      </div>

      {comments.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 rounded-lg border p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {getInitials(c.user_email)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {c.user_email?.split("@")[0] ?? "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(c.created_at)}
                </span>
                {c.user_id === currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    disabled={deletingId === c.id}
                    className="ml-auto rounded p-0.5 text-muted-foreground hover:text-destructive"
                  >
                    <TrashIcon className="size-3" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {currentUserId && (
        <form onSubmit={handlePost} className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            maxLength={2000}
            rows={2}
            className="flex-1 resize-none rounded-lg border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="sm"
            disabled={posting || !content.trim()}
            className="self-end"
          >
            {posting && <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />}
            Post
          </Button>
        </form>
      )}
    </div>
  );
}
