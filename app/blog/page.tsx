import type { Metadata } from "next";
import Link from "next/link";
import { blogPostsSorted } from "@/lib/blog/posts";
import BlogCard from "@/app/components/blog/BlogCard";
import AnimatedSection from "@/app/components/ui/AnimatedSection";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Blog – SecureScope",
  description: "Notes on building IT tooling, security workflows, automation, and portfolio-grade polish.",
};

export default function BlogIndexPage() {
  const posts = blogPostsSorted();

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-[var(--ss-border)] px-4 py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,color-mix(in_srgb,var(--ss-accent)_18%,transparent),transparent)]"
          aria-hidden
        />
        <AnimatedSection className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ss-text-secondary)]">
            📰 Blog
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-4xl">
            Latest from the desk
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ss-text-secondary)] sm:text-base">
            Practical write-ups on security checks, automation, Microsoft 365, and how this toolkit is built — written for
            working IT and marketing operators.
          </p>
        </AnimatedSection>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>

        <AnimatedSection className="mt-14 rounded-2xl border border-dashed border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--ss-text)]">More posts coming</p>
          <p className="mt-2 text-xs text-[var(--ss-text-secondary)] max-w-md mx-auto leading-relaxed">
            Individual routes use a shared layout so future MDX or CMS content can drop in without changing URLs.
          </p>
          <Link
            href={withBasePath("/contact")}
            className="mt-4 inline-flex text-xs font-semibold text-[var(--ss-accent)] hover:underline motion-safe:transition-colors"
          >
            Suggest a topic
          </Link>
        </AnimatedSection>
      </div>
    </main>
  );
}
