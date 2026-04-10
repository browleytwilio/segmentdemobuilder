import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { StatCounter } from "@/components/marketing/sections/stat-counter";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { AnimatedSection } from "@/components/marketing/animations/animated-section";
import { useCases } from "@/lib/marketing/data/use-cases";

export function generateStaticParams() {
  return useCases.map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const uc = useCases.find((u) => u.slug === slug);
  if (!uc) return {};
  return {
    title: `${uc.industry} | Use Cases | Segment Demo Builder`,
    description: uc.description,
  };
}

export default async function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const uc = useCases.find((u) => u.slug === slug);
  if (!uc) notFound();

  const relatedCases = useCases.filter((u) => u.slug !== slug).slice(0, 2);

  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            {uc.industry}
          </p>
          <GradientHeading as="h1">{uc.tagline}</GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            {uc.description}
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              render={<Link href="/sign-in" />}
              className="bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-90"
            >
              Build a {uc.industry} Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </SectionWrapper>

      {/* Challenges & Solutions */}
      <SectionWrapper>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          <AnimatedSection>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Challenges
              </h2>
              <ul className="space-y-4">
                {uc.challenges.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 text-red-400/60">&#x2717;</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <div className="rounded-2xl border border-marketing-green/20 bg-marketing-green/[0.03] p-8">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Solutions
              </h2>
              <ul className="space-y-4">
                {uc.solutions.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-marketing-green" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </SectionWrapper>

      {/* Scenarios */}
      <SectionWrapper background="dots">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Included Scenarios
        </h2>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {uc.scenarios.map((s, i) => (
            <AnimatedSection key={s.name} delay={i * 0.1}>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <h3 className="mb-2 font-semibold text-foreground">
                  {s.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {s.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </SectionWrapper>

      {/* Metrics */}
      <SectionWrapper background="muted">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Results
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4">
          {uc.metrics.map((m) => {
            const numericValue = parseFloat(m.value.replace(/[^0-9.]/g, ""));
            const suffix = m.value.replace(/[0-9.]/g, "");
            return (
              <StatCounter
                key={m.label}
                value={numericValue}
                suffix={suffix}
                label={m.label}
              />
            );
          })}
        </div>
      </SectionWrapper>

      {/* Related */}
      <SectionWrapper>
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
          Explore other industries
        </h2>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {relatedCases.map((rc) => (
            <Link
              key={rc.slug}
              href={`/use-cases/${rc.slug}`}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:border-white/[0.15]"
            >
              <h3 className="font-semibold text-foreground">{rc.industry}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{rc.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-marketing-blue">
                Learn more
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      <CTASection
        heading={`Ready to build ${uc.industry} demos?`}
        description="Start with pre-built scenarios and customize for each prospect."
      />
    </>
  );
}
