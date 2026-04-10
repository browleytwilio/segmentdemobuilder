"use client";

import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";

interface CopilotTriggerProps {
  open: boolean;
  onToggle: () => void;
}

export function CopilotTrigger({ open, onToggle }: CopilotTriggerProps) {
  if (open) return null;

  return (
    <Button
      onClick={onToggle}
      size="sm"
      className="fixed bottom-4 right-4 z-50 h-10 gap-2 rounded-full shadow-lg print:hidden"
    >
      <SparklesIcon className="size-4" />
      AI Copilot
    </Button>
  );
}
