import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { AnimatedSection } from "@/components/marketing/animations/animated-section";
import { jobs, benefits } from "@/lib/marketing/data/careers";
import { companyValues } from "@/lib/marketing/data/team";

export const metadata: Metadata = {
  title: "Careers | Segment Demo Builder",
  description:
    "Join us in building the future of SE enablement. Open positions in engineering, design, product, and solutions.",
};

export default function CareersPage() {
  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-purple">
            Careers
          </p>
          <GradientHeading as="h1">
            Build the future of demo automation
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            We&apos;re a small, focused team solving a real problem for Sales
            Engineers worldwide. Join us if you want your work to have direct
            impact.
          </p>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper>
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Why join us
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {companyValues.map((value, i) => {
            const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[value.icon] ?? LucideIcons.Star;
            return (
              <AnimatedSection key={value.title} delay={i * 0.1}>
                <div className="flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-marketing-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {value.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Benefits */}
      <SectionWrapper background="muted">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Benefits & Perks
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => {
            const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[benefit.icon] ?? LucideIcons.Star;
            return (
              <AnimatedSection key={benefit.title} delay={i * 0.08}>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-marketing-purple" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Open positions */}
      <SectionWrapper>
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Open Positions
        </h2>
        <div className="mx-auto max-w-3xl space-y-4">
          {jobs.map((job, i) => (
            <AnimatedSection key={job.id} delay={i * 0.08}>
              <div className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:border-white/[0.15]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {job.department}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {job.type}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {job.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href="/contact" />}
                    className="shrink-0"
                  >
                    Apply
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </SectionWrapper>

      <CTASection
        heading="Don't see a perfect fit?"
        description="We're always looking for exceptional people. Send us your story."
        primaryCta={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
