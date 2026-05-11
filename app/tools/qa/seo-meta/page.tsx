"use client";

import { useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

const TAGS = [
  {
    name: "<title>",
    purpose: "Browser tab + SERP title. 50–60 chars.",
    placeholder: "Acme — Best widgets in the UK",
  },
  {
    name: "<meta name=\"description\">",
    purpose: "SERP description snippet. 140–160 chars.",
    placeholder: "Hand-made widgets, free next-day delivery across the UK.",
  },
  {
    name: "<h1>",
    purpose: "Main heading of the page. One per page.",
    placeholder: "Hand-made widgets, delivered in 24 hours",
  },
  {
    name: "Open Graph (og:title / og:description / og:image)",
    purpose: "Social link previews on Facebook, LinkedIn, etc.",
    placeholder: "og:title='Acme widgets' og:image='https://example.com/og.png'",
  },
  {
    name: "Twitter Card (twitter:card etc.)",
    purpose: "Rich card previews on X / Twitter.",
    placeholder: "twitter:card='summary_large_image'",
  },
  {
    name: "<link rel=\"canonical\">",
    purpose: "Tells search engines the preferred URL for this page.",
    placeholder: "https://example.com/widgets",
  },
];

export default function SeoMetaPage() {
  const [url, setUrl] = useState("https://example.com");

  return (
    <ToolPageLayout
      title="SEO Meta Tag Checker"
      description="See the meta tags Google and social platforms read on a page. This GitHub-Pages friendly placeholder shows what to look for and where the serverless integration plugs in."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="SEO and social-share hygiene." accent="cyan" />
        <Meta label="Why" body="Bad metadata costs you traffic on every share." accent="violet" />
        <Meta
          label="Future API"
          body="Live checks require fetching the target page, which the browser cannot do directly because of CORS. Wire a Vercel / Netlify serverless function to fetch the HTML server-side and return parsed tags."
          accent="emerald"
        />
      </div>

      <div className="rounded-[24px] border border-amber-400/30 bg-amber-500/5 p-4 text-xs leading-6 text-amber-100/85 mb-5">
        <strong>CORS limitation:</strong> the browser cannot fetch a third-party page directly.
        Hook this UI to a serverless function (Vercel / Netlify) that fetches the URL server-side
        and parses the HTML. Frontend never sees the API key (if any) — only the parsed result.
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <label className="block text-xs text-white/65">
          <span className="mb-1 block font-medium text-white/75">Page URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
        </label>

        <div className="mt-4 space-y-3">
          {TAGS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-mono text-sm text-white">{t.name}</p>
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Coming Soon API
                </span>
              </div>
              <p className="text-xs leading-5 text-white/65">{t.purpose}</p>
              <p className="mt-1 text-[11px] font-mono text-white/40">Example: {t.placeholder}</p>
            </div>
          ))}
        </div>
      </div>

      {/*
        SERVERLESS PLAN
        ---------------
        /api/seo-meta.ts (Vercel) or /netlify/functions/seo-meta.ts:
          1. Validate URL (http/https only; deny private IP ranges).
          2. fetch(url, { redirect: 'follow' }) with a short timeout + size cap.
          3. Parse <title>, <meta name=...>, og:*, twitter:*, canonical, h1.
          4. Return JSON { title, description, h1, og: {...}, twitter: {...}, canonical }.
          5. Cache via CDN to stay polite to the target.
      */}
    </ToolPageLayout>
  );
}

function Meta({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}
