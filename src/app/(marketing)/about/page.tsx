import type { Metadata } from "next";
import * as LucideIcons from "lucide-react";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { CTASection } from "@/components/marketing/sections/cta-section";
import { AnimatedSection } from "@/components/marketing/animations/animated-section";
import { team, companyValues } from "@/lib/marketing/data/team";

export const metadata: Metadata = {
  title: "About | Segment Demo Builder",
  description:
    "Built by SEs, for SEs. Meet the team behind the Segment Demo Builder and learn about our mission.",
};

export default function AboutPage() {
  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-purple">
            About
          </p>
          <GradientHeading as="h1">Built by SEs, for SEs</GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            We started as Sales Engineers frustrated by the hours spent building
            repetitive demos. So we built a tool to automate the work and let SEs
            focus on what matters — telling compelling stories.
          </p>
        </div>
      </SectionWrapper>

      {/* Mission */}
      <SectionWrapper>
        <AnimatedSection>
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center lg:p-12">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Our Mission
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Make every SE&apos;s demo as good as the best SE&apos;s demo. We believe demo
              quality shouldn&apos;t depend on individual experience — it should be
              systematized, shared, and continuously improved.
            </p>
          </div>
        </AnimatedSection>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper background="dots">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Our Values
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {companyValues.map((value, i) => {
            const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[value.icon] ?? LucideIcons.Star;
            return (
              <AnimatedSection key={value.title} delay={i * 0.1}>
                <div className="flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
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

      {/* Team */}
      <SectionWrapper>
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Meet the Team
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <AnimatedSection key={member.name} delay={i * 0.1}>
              <div
                className={`rounded-2xl border p-6 ${
                  member.featured
                    ? "border-marketing-blue/30 bg-marketing-blue/[0.05]"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-marketing-blue to-marketing-purple text-lg font-semibold text-white">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-marketing-blue">{member.role}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {member.bio}
                </p>
                {member.featured && (
                  <span className="mt-4 inline-block rounded-full bg-marketing-blue/10 px-3 py-1 text-xs font-medium text-marketing-blue">
                    Founder & Builder
                  </span>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </SectionWrapper>

      <CTASection
        heading="Join us in transforming SE enablement"
        description="Start building better demos today, or join our team to help build the future."
        primaryCta={{ label: "Get Started", href: "/login" }}
        secondaryCta={{ label: "View Careers", href: "/careers" }}
      />
    </>
  );
}
