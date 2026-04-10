"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CopilotTrigger } from "./copilot-trigger";

const CopilotChat = dynamic(
  () => import("./copilot-chat").then((m) => m.CopilotChat),
  { ssr: false }
);

export function CopilotWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CopilotTrigger open={open} onToggle={() => setOpen(true)} />
      {open && <CopilotChat open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
