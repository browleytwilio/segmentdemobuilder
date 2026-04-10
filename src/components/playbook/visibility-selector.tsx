"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updatePlaybookVisibility } from "@/app/(app)/dashboard/actions";
import type { PlaybookVisibility } from "@/lib/compiler/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics/events";

const VISIBILITY_OPTIONS: {
  value: PlaybookVisibility;
  label: string;
  description: string;
}[] = [
  { value: "private", label: "Private", description: "Only you" },
  { value: "shared", label: "Shared", description: "All Twilio" },
  { value: "public", label: "Public Link", description: "Anyone with link" },
];

interface VisibilitySelectorProps {
  playbookId: string;
  currentVisibility: PlaybookVisibility;
}

export function VisibilitySelector({
  playbookId,
  currentVisibility,
}: VisibilitySelectorProps) {
  const [loading, setLoading] = useState(false);

  async function handleChange(value: string | null) {
    if (!value || value === currentVisibility) return;

    setLoading(true);
    const result = await updatePlaybookVisibility(
      playbookId,
      value as PlaybookVisibility
    );
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Playbook Visibility Changed", {
        playbook_id: playbookId,
        visibility: value,
      });
      toast.success(
        value === "shared"
          ? "Playbook shared with Twilio"
          : value === "public"
            ? "Public link enabled"
            : "Playbook set to private"
      );
    }
    setLoading(false);
  }

  return (
    <Select
      value={currentVisibility}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className="w-[150px] h-8" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {VISIBILITY_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
