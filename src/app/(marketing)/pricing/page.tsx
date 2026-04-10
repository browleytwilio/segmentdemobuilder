import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Pricing | Segment Demo Builder",
  description:
    "Free Starter plan with 5 playbooks. Pro plan for SE teams. Enterprise for custom deployments. Start building demos today.",
};

export default function PricingPage() {
  return <PricingContent />;
}
