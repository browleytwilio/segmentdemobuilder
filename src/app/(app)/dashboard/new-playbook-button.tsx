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
      className={variant === "default" ? "bg-app-accent hover:bg-app-accent/90 text-app-accent-foreground" : undefined}
      render={<Link href="/builder" />}
      onClick={() => trackEvent("New Playbook Clicked", { location })}
    >
      {location === "header" ? "New Playbook" : "Create Playbook"}
    </Button>
  );
}
