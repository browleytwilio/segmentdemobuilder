import type { Metadata } from "next";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { TestimonialCard } from "@/components/marketing/sections/testimonial-card";
import { LogoCloud } from "@/components/marketing/sections/logo-cloud";
import { StatCounter } from "@/components/marketing/sections/stat-counter";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { testimonials, logoCompanies } from "@/lib/marketing/data/testimonials";

export const metadata: Metadata = {
  title: "Customers | Segment Demo Builder",
  description:
    "See how SE teams at leading companies use Demo Builder to transform their demo workflow and win more deals.",
};

const stats = [
  { value: 74, suffix: "%", label: "Average time saved on demo prep" },
  { value: 500, suffix: "+", label: "Playbooks generated" },
  { value: 89, suffix: "%", label: "SE satisfaction score" },
  { value: 34, suffix: "%", label: "Demo-to-POC conversion rate" },
];

export default function CustomersPage() {
  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-green">
            Customers
          </p>
          <GradientHeading as="h1">
            Trusted by SE teams everywhere
          </GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            From startups to enterprise SE organizations, teams are using Demo
            Builder to win more deals with less prep time.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <LogoCloud logos={logoCompanies} />
      </SectionWrapper>

      <SectionWrapper background="muted">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          What our customers say
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.id}
              quote={t.quote}
              name={t.name}
              role={t.role}
              company={t.company}
              index={i}
            />
          ))}
        </div>
      </SectionWrapper>

      <CTASection
        heading="Join the teams winning more deals"
        description="Start building demo playbooks in minutes. Free to get started."
      />
    </>
  );
}
