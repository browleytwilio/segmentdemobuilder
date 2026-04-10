"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, TagIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";
import {
  createTag,
  addTagToPlaybook,
  removeTagFromPlaybook,
} from "@/app/(app)/dashboard/actions";
import type { Tag } from "@/lib/compiler/types";

const TAG_COLORS = ["gray", "blue", "green", "red", "purple", "orange"];

interface TagManagerProps {
  playbookId: string;
  appliedTags: Tag[];
  allTags: Tag[];
}

export function TagManager({ playbookId, appliedTags, allTags }: TagManagerProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("blue");
  const [loading, setLoading] = useState<string | null>(null);

  const appliedIds = new Set(appliedTags.map((t) => t.id));

  async function handleToggleTag(tag: Tag) {
    setLoading(tag.id);
    const isApplied = appliedIds.has(tag.id);

    const result = isApplied
      ? await removeTagFromPlaybook(playbookId, tag.id)
      : await addTagToPlaybook(playbookId, tag.id);

    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent(isApplied ? "Tag Removed" : "Tag Applied", {
        playbook_id: playbookId,
        tag_id: tag.id,
      });
    }
    setLoading(null);
  }

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading("creating");
    const result = await createTag(newName.trim(), newColor);
    if (result.error) {
      toast.error(result.error);
    } else if (result.id) {
      trackEvent("Tag Created", { tag_name: newName.trim(), color: newColor });
      // Auto-apply the new tag
      await addTagToPlaybook(playbookId, result.id);
      trackEvent("Tag Applied", { playbook_id: playbookId, tag_id: result.id });
      setNewName("");
      setCreating(false);
    }
    setLoading(null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" />
        }
      >
        <TagIcon className="size-3" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
          Tags
        </p>

        {allTags.length === 0 && !creating && (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            No tags yet. Create one below.
          </p>
        )}

        <div className="space-y-0.5">
          {allTags.map((tag) => (
            <label
              key={tag.id}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={appliedIds.has(tag.id)}
                onCheckedChange={() => handleToggleTag(tag)}
                disabled={loading === tag.id}
              />
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: `var(--color-${tag.color}, ${tag.color})`,
                }}
              />
              {tag.name}
            </label>
          ))}
        </div>

        {creating ? (
          <form onSubmit={handleCreateTag} className="mt-2 space-y-2 border-t pt-2">
            <Input
              placeholder="Tag name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={30}
              autoFocus
              className="h-7 text-xs"
            />
            <div className="flex gap-1">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`size-5 rounded-full border-2 ${
                    newColor === c ? "border-foreground" : "border-transparent"
                  }`}
                  style={{
                    backgroundColor: `var(--color-${c}, ${c})`,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <Button
                type="submit"
                size="sm"
                className="h-6 flex-1 text-xs"
                disabled={loading === "creating"}
              >
                Create
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 w-full justify-start gap-1.5 text-xs"
            onClick={() => setCreating(true)}
          >
            <PlusIcon className="size-3" />
            New tag
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
