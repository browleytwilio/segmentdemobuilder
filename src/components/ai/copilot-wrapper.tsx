"use client";

import { useState } from "react";
import { CopilotChat } from "./copilot-chat";
import { CopilotTrigger } from "./copilot-trigger";

export function CopilotWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CopilotTrigger open={open} onToggle={() => setOpen(true)} />
      <CopilotChat open={open} onClose={() => setOpen(false)} />
    </>
  );
}
