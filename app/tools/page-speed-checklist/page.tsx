"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function PageSpeedChecklistPage() {
  return (
    <ChecklistTool
      title="Page Speed Checklist"
      description="A focused checklist for hitting good Core Web Vitals scores — images, fonts, scripts, server, and measurement."
      skill="Web performance, Core Web Vitals, frontend optimisation"
      why="Performance is a real-money SEO and conversion factor. A short checklist beats a 200-line audit report when you actually want to ship fixes."
      futureApi="Wire to PageSpeed Insights API, Lighthouse CI, or Vercel Speed Insights for live LCP/INP/CLS measurements per deploy."
      inputs={[
        { id: "page", label: "Page being audited", placeholder: "https://example.com/" },
      ]}
      sections={[
        {
          title: "Images",
          items: [
            { id: "ps-i1", label: "All images use modern format (AVIF or WebP) where supported" },
            { id: "ps-i2", label: "Largest hero image has explicit width and height attributes" },
            { id: "ps-i3", label: "Above-the-fold images are eagerly loaded; below-fold use loading=\"lazy\"" },
            { id: "ps-i4", label: "Hero image preloaded via <link rel=preload as=image>" },
            { id: "ps-i5", label: "Responsive images use srcset / sizes (or Next.js <Image />)" },
          ],
        },
        {
          title: "Fonts",
          items: [
            { id: "ps-f1", label: "Web fonts self-hosted or use next/font (no FOIT)" },
            { id: "ps-f2", label: "font-display: swap is set" },
            { id: "ps-f3", label: "Only the weights/subsets actually used are loaded" },
            { id: "ps-f4", label: "Critical font preloaded" },
          ],
        },
        {
          title: "Scripts & CSS",
          items: [
            { id: "ps-s1", label: "Third-party scripts (analytics, chat, ads) loaded with defer / async" },
            { id: "ps-s2", label: "Unused JavaScript is tree-shaken / code-split" },
            { id: "ps-s3", label: "Critical CSS is inlined; rest deferred" },
            { id: "ps-s4", label: "No render-blocking synchronous scripts in <head>" },
            { id: "ps-s5", label: "Long tasks (>50ms on mobile) profiled and split" },
          ],
        },
        {
          title: "Server & caching",
          items: [
            { id: "ps-c1", label: "TTFB < 600ms on a warm cache" },
            { id: "ps-c2", label: "Static assets have a long Cache-Control + immutable" },
            { id: "ps-c3", label: "HTML responses have a short cache + revalidation strategy (ISR/stale-while-revalidate)" },
            { id: "ps-c4", label: "CDN in front of the origin (Vercel, Cloudflare, etc.)" },
          ],
        },
        {
          title: "Measure",
          items: [
            { id: "ps-m1", label: "Lighthouse mobile score > 90 for performance" },
            { id: "ps-m2", label: "LCP < 2.5s, INP < 200ms, CLS < 0.1 (lab + field)" },
            { id: "ps-m3", label: "Real-user monitoring (RUM) enabled on production" },
            { id: "ps-m4", label: "Performance budget defined in CI (Lighthouse CI / web-vitals)" },
          ],
        },
      ]}
    />
  );
}
