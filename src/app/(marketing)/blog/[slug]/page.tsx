import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { blogPosts } from "@/lib/marketing/data/blog-posts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Blog | Segment Demo Builder`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <SectionWrapper className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Blog
          </Link>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-marketing-blue/10 px-3 py-1 text-xs font-medium text-marketing-blue"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center gap-4 border-b border-white/[0.06] pb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-marketing-blue to-marketing-purple text-sm font-semibold text-white">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {post.author.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {post.author.role} &middot; {post.date} &middot;{" "}
                {post.readingTime}
              </p>
            </div>
          </div>

          {/* Article body */}
          <article className="prose prose-invert prose-sm mt-10 max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-li:text-muted-foreground prose-h2:mt-10 prose-h2:text-2xl prose-h3:mt-6 prose-h3:text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </article>
        </div>
      </SectionWrapper>

      {/* Related posts */}
      <SectionWrapper background="muted">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
          Continue reading
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {relatedPosts.map((rp) => (
            <Link
              key={rp.slug}
              href={`/blog/${rp.slug}`}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-white/[0.15]"
            >
              <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                {rp.title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground">{rp.date}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-marketing-blue">
                Read
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
