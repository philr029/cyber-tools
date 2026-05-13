import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogSlugs, getBlogPost } from "@/lib/blog/posts";
import AnimatedSection from "@/app/components/ui/AnimatedSection";
import { withBasePath } from "@/lib/base-path";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} – SecureScope Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <AnimatedSection>
          <nav className="mb-8 text-xs text-[var(--ss-text-secondary)]">
            <Link href={withBasePath("/blog")} className="font-semibold text-[var(--ss-accent)] hover:underline motion-safe:transition-colors">
              ← Blog
            </Link>
            <span className="mx-2 text-[color-mix(in_srgb,var(--ss-text-secondary)_45%,transparent)]">/</span>
            <span className="text-[var(--ss-text)]">{post.category}</span>
          </nav>

          <header className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ss-text-secondary)]">
              {post.date} · {post.readingMinutes} min read
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-[2.15rem] leading-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--ss-text-secondary)]">{post.excerpt}</p>
          </header>

          <div className="prose-blog space-y-5 text-sm leading-relaxed text-[var(--ss-text-secondary)] sm:text-base">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <footer className="mt-12 flex flex-wrap gap-3 border-t border-[var(--ss-border)] pt-8">
            <Link
              href={withBasePath("/pricing")}
              className="ss-pill ss-pill-primary px-4 py-2 text-xs font-semibold text-white motion-safe:transition-transform motion-safe:hover:-translate-y-px"
            >
              View pricing
            </Link>
            <Link
              href={withBasePath("/tools/browse")}
              className="ss-pill ss-pill-ghost px-4 py-2 text-xs font-semibold motion-safe:transition-transform motion-safe:hover:-translate-y-px"
            >
              Explore tools
            </Link>
          </footer>
        </AnimatedSection>
      </article>
    </main>
  );
}
