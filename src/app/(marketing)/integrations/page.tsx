import type { Metadata } from "next";
import { IntegrationsContent } from "./integrations-content";

export const metadata: Metadata = {
  title: "Integrations | Segment Demo Builder",
  description:
    "Generate demos showcasing 300+ Segment integrations — sources, destinations, and platform tools.",
};

export default function IntegrationsPage() {
  return <IntegrationsContent />;
}
