"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/events";

interface NewPlaybookButtonProps {
  location: "header" | "empty_state";
  variant?: "default" | "outline";
}

export function NewPlaybookButton({
  location,
  variant = "default",
}: NewPlaybookButtonProps) {
  return (
    <Button
      variant={variant}
      render={<Link href="/builder" />}
      onClick={() => trackEvent("New Playbook Clicked", { location })}
    >
      {location === "header" ? "New Playbook" : "Create Playbook"}
    </Button>
  );
}
