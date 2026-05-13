"use client";

import Link from "next/link";
import type { BlogPost } from "@/lib/blog/posts";
import { withBasePath } from "@/lib/base-path";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={withBasePath(`/blog/${post.slug}`)}
      className="group ss-card card-lift flex h-full flex-col rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_72%,transparent)] p-5 sm:p-6 motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-300 motion-safe:hover:-translate-y-1"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)]">
        <span className="rounded-full bg-[var(--ss-accent-soft)] px-2.5 py-0.5 text-[var(--ss-accent)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_28%,transparent)]">
          {post.category}
        </span>
        <span>{post.date}</span>
        <span className="text-[color-mix(in_srgb,var(--ss-text-secondary)_55%,transparent)]">· {post.readingMinutes} min</span>
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-[var(--ss-text)] group-hover:text-[var(--ss-accent)] motion-safe:transition-colors">
        {post.title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ss-text-secondary)]">{post.excerpt}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--ss-accent)]">
        Read article
        <svg className="h-3.5 w-3.5 motion-safe:transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </Link>
  );
}
