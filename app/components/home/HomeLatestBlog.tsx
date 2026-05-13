"use client";

import Link from "next/link";
import { blogPostsSorted } from "@/lib/blog/posts";
import BlogCard from "@/app/components/blog/BlogCard";
import AnimatedSection from "@/app/components/ui/AnimatedSection";
import { withBasePath } from "@/lib/base-path";

export default function HomeLatestBlog() {
  const posts = blogPostsSorted().slice(0, 3);

  return (
    <section className="mb-12 scroll-mt-28" aria-labelledby="home-blog-heading">
      <AnimatedSection>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ss-text-secondary)]">📰 Latest from the blog</p>
            <h2 id="home-blog-heading" className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-3xl">
              Field notes & build log
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ss-text-secondary)]">
              Security, DNS, automation, and Microsoft 365 — short articles you can skim between tickets.
            </p>
          </div>
          <Link
            href={withBasePath("/blog")}
            className="ss-pill ss-pill-ghost btn-micro inline-flex shrink-0 items-center justify-center px-4 py-2 text-xs font-semibold motion-safe:transition-transform motion-safe:hover:-translate-y-px"
          >
            Read blog
          </Link>
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      </AnimatedSection>
    </section>
  );
}
