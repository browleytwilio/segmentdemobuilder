import type { Metadata } from "next";
import { WalkthroughContent } from "./walkthrough-content";

export const metadata: Metadata = {
  title: "See It In Action | Segment Demo Builder",
  description:
    "Follow an SE through a real demo-prep scenario — from blank slate to complete Segment playbook in under an hour.",
};

export default function WalkthroughPage() {
  return <WalkthroughContent />;
}
