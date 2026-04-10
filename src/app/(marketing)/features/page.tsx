import type { Metadata } from "next";
import { FeaturesContent } from "./features-content";

export const metadata: Metadata = {
  title: "Features | Segment Demo Builder",
  description:
    "AI-powered prompt compilation, multi-architecture support, industry-tailored scenarios, and team collaboration for Sales Engineers.",
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
