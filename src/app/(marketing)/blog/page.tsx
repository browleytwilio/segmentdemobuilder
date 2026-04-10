import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { AnimatedSection } from "@/components/marketing/animations/animated-section";
import { blogPosts } from "@/lib/marketing/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog | Segment Demo Builder",
  description:
    "Insights on demo automation, SE enablement, and CDP best practices from the Demo Builder team.",
};

export default function BlogPage() {
  const featured = blogPosts.find((p) => p.featured);
  const rest = blogPosts.filter((p) => !p.featured);

  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            Blog
          </p>
          <GradientHeading as="h1">Insights & Updates</GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Demo strategy, SE enablement, and product updates from the team.
          </p>
        </div>
      </SectionWrapper>

      {/* Featured post */}
      {featured && (
        <SectionWrapper>
          <AnimatedSection>
            <Link
              href={`/blog/${featured.slug}`}
              className="group block overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 transition-colors hover:border-white/[0.15] lg:p-12"
            >
              <div className="flex flex-wrap gap-2">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-marketing-blue/10 px-3 py-1 text-xs font-medium text-marketing-blue"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {featured.author.name} &middot; {featured.date} &middot;{" "}
                  {featured.readingTime}
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-marketing-blue transition-colors group-hover:text-marketing-cyan">
                  Read more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </AnimatedSection>
        </SectionWrapper>
      )}

      {/* Post grid */}
      <SectionWrapper className="pt-0">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <AnimatedSection key={post.slug} delay={i * 0.1}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:border-white/[0.15]"
              >
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-4 text-xs text-muted-foreground/60">
                  {post.author.name} &middot; {post.date} &middot;{" "}
                  {post.readingTime}
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
