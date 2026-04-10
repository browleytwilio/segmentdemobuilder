import { HomeHero } from "./home-hero";
import { HomeFeatures } from "./home-features";
import { HomeHowItWorks } from "./home-how-it-works";
import { HomeStats } from "./home-stats";
import { HomeTestimonials } from "./home-testimonials";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { DataFlowVisualizer } from "@/components/marketing/sections/data-flow-visualizer";

export default function MarketingHomePage() {
  return (
    <>
      <HomeHero />
      <HomeFeatures />
      <DataFlowVisualizer />
      <HomeHowItWorks />
      <HomeStats />
      <HomeTestimonials />
      <CTASection
        heading="Ready to build better Segment demos?"
        description="Sign in with your Twilio account and build your first playbook in under 5 minutes."
        primaryCta={{ label: "Sign In with Twilio", href: "/sign-in" }}
        secondaryCta={{ label: "See How It Works", href: "/how-it-works" }}
      />
    </>
  );
}
