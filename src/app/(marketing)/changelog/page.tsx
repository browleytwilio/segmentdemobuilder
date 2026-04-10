import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { AnimatedSection } from "@/components/marketing/animations/animated-section";
import { changelog } from "@/lib/marketing/data/changelog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Changelog | Segment Demo Builder",
  description:
    "Product updates, new features, and improvements to the Segment Demo Builder.",
};

const typeColors = {
  feature: "bg-marketing-blue/10 text-marketing-blue border-marketing-blue/20",
  improvement: "bg-marketing-green/10 text-marketing-green border-marketing-green/20",
  fix: "bg-marketing-purple/10 text-marketing-purple border-marketing-purple/20",
};

export default function ChangelogPage() {
  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            Changelog
          </p>
          <GradientHeading as="h1">What&apos;s new</GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Product updates, new features, and improvements.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="relative mx-auto max-w-3xl">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 hidden h-full w-px bg-white/[0.06] sm:block" />

          <div className="space-y-12">
            {changelog.map((entry, i) => (
              <AnimatedSection key={entry.version} delay={i * 0.08}>
                <div className="relative sm:pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 hidden h-2.5 w-2.5 -translate-x-1 rounded-full border-2 border-marketing-blue bg-background sm:block" />

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground/50">
                      {entry.version}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        typeColors[entry.type]
                      )}
                    >
                      {entry.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground/40">
                      {entry.date}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-foreground">
                    {entry.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.description}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {entry.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground/80"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
