import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeHero } from "./home-hero";
import { HomeFeatures } from "./home-features";
import { HomeHowItWorks } from "./home-how-it-works";
import { HomeStats } from "./home-stats";
import { HomeTestimonials } from "./home-testimonials";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { LogoCloud } from "@/components/marketing/sections/logo-cloud";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { logoCompanies } from "@/lib/marketing/data/testimonials";

export default async function MarketingHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <>
      <HomeHero />
      <SectionWrapper>
        <div className="text-center">
          <p className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground/60">
            Trusted by SE teams at leading companies
          </p>
          <LogoCloud logos={logoCompanies} />
        </div>
      </SectionWrapper>
      <HomeFeatures />
      <HomeHowItWorks />
      <HomeStats />
      <HomeTestimonials />
      <CTASection
        heading="Ready to transform your demo workflow?"
        description="Join SE teams who've cut demo prep from hours to minutes. Start building your first playbook today."
        primaryCta={{ label: "Get Started Free", href: "/login" }}
        secondaryCta={{ label: "See How It Works", href: "/how-it-works" }}
      />
    </>
  );
}
