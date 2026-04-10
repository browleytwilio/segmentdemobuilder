import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Building2, Landmark, Play } from "lucide-react";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { AnimatedSection } from "@/components/marketing/animations/animated-section";
import { useCases } from "@/lib/marketing/data/use-cases";

export const metadata: Metadata = {
  title: "Use Cases | Segment Demo Builder",
  description:
    "Industry-tailored demo playbooks for E-commerce, B2B SaaS, FinTech, and Media & Entertainment.",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Building2,
  Landmark,
  Play,
};

export default function UseCasesPage() {
  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            Use Cases
          </p>
          <GradientHeading as="h1">
            Demos built for your industry
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Pre-built personalization scenarios mapped to real CDP capabilities.
            Select your industry to see what&apos;s possible.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-6 sm:grid-cols-2">
          {useCases.map((uc, i) => {
            const Icon = iconMap[uc.icon] ?? ShoppingCart;
            return (
              <AnimatedSection key={uc.slug} delay={i * 0.1}>
                <Link
                  href={`/use-cases/${uc.slug}`}
                  className="group block h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 transition-colors hover:border-white/[0.15] hover:bg-white/[0.05]"
                >
                  <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-3">
                    <Icon className="h-6 w-6 text-marketing-blue" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {uc.industry}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {uc.tagline}
                  </p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {uc.scenarios.slice(0, 3).map((s) => (
                      <span
                        key={s.name}
                        className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-muted-foreground"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-marketing-blue transition-colors group-hover:text-marketing-cyan">
                    Explore use case
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </SectionWrapper>

      <CTASection
        heading="Build a demo for your industry"
        description="Start with industry-specific scenarios and customize for each prospect."
      />
    </>
  );
}
