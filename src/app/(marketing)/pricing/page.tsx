import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Access | Segment Demo Builder",
  description:
    "Free for every Twilio SE. Sign in with your @twilio.com account for full access to all features — no tiers, no limits.",
};

export default function PricingPage() {
  return <PricingContent />;
}
