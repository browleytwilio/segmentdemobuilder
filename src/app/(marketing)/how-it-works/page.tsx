import type { Metadata } from "next";
import { HowItWorksContent } from "./how-it-works-content";

export const metadata: Metadata = {
  title: "How It Works | Segment Demo Builder",
  description:
    "Four simple steps: define context, choose architecture, select scenarios, generate your playbook. Start building in minutes.",
};

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
