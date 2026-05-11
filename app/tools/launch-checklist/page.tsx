"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function LaunchChecklistPage() {
  return (
    <ChecklistTool
      title="Website Launch Checklist"
      description="Pre-launch sweep across SEO, analytics, forms, SSL, mobile, accessibility, performance and backups. Catch the basics before going live."
      skill="Web QA, SEO, performance, accessibility, release management."
      why="The most common launch incidents are 100% preventable — missing analytics, redirects pointing to staging, no backups."
      futureApi="Hook the live URL into Lighthouse CI, Pingdom, or Sentry release tracking for ongoing post-launch validation."
      inputs={[
        { id: "domain", label: "Production domain", placeholder: "example.com" },
        { id: "launch", label: "Launch date", type: "date" },
        { id: "owner", label: "Release owner", placeholder: "Name / team" },
      ]}
      sections={[
        {
          title: "SEO & metadata",
          items: [
            { id: "seo-1", label: "Unique <title> and meta description on every public page." },
            { id: "seo-2", label: "Open Graph (og:title, og:description, og:image) tags present and tested in the SERP/OG preview tool." },
            { id: "seo-3", label: "Canonical URLs set; no accidental http→https→http redirect chains." },
            { id: "seo-4", label: "robots.txt allows production and disallows staging." },
            { id: "seo-5", label: "sitemap.xml generated and submitted to Search Console / Bing Webmaster." },
            { id: "seo-6", label: "Structured data validates in Rich Results Test." },
          ],
        },
        {
          title: "Analytics & tracking",
          items: [
            { id: "an-1", label: "Production GA4 / Plausible / Posthog ID swapped in (not the staging one)." },
            { id: "an-2", label: "Cookie consent banner respects opt-out before analytics fires." },
            { id: "an-3", label: "Key events (signup, contact-form submit) configured and tested." },
            { id: "an-4", label: "UTM-tagged campaign links validated in a preview environment." },
          ],
        },
        {
          title: "Forms & lead capture",
          items: [
            { id: "fm-1", label: "Contact / signup forms submit successfully on production." },
            { id: "fm-2", label: "Spam protection in place (honeypot, hCaptcha, rate-limit)." },
            { id: "fm-3", label: "Confirmation emails delivered (check spam folder)." },
            { id: "fm-4", label: "Submissions flow into the correct CRM / ticket queue." },
            { id: "fm-5", label: "Accessible labels and error messages on every field." },
          ],
        },
        {
          title: "Security",
          items: [
            { id: "sec-1", label: "Valid HTTPS certificate covering apex and www (or wildcard)." },
            { id: "sec-2", label: "HTTP automatically redirects to HTTPS with HSTS preload-ready." },
            { id: "sec-3", label: "CSP, X-Frame-Options, Referrer-Policy and X-Content-Type-Options headers in place." },
            { id: "sec-4", label: "Admin and CMS endpoints behind MFA and IP-restricted where possible." },
            { id: "sec-5", label: "Secrets removed from client bundle (no API keys in `next.config` exposed)." },
          ],
        },
        {
          title: "Mobile & accessibility",
          items: [
            { id: "mb-1", label: "Looks good at 320, 375, 414, 768, 1024, 1440 widths." },
            { id: "mb-2", label: "Tap targets ≥ 44×44px; no critical text under 12px." },
            { id: "mb-3", label: "Colour contrast ≥ AA on all interactive elements." },
            { id: "mb-4", label: "Keyboard navigation works from header to footer." },
            { id: "mb-5", label: "Screen reader labels confirmed on hero CTAs and forms." },
          ],
        },
        {
          title: "Performance",
          items: [
            { id: "pf-1", label: "Lighthouse mobile score ≥ 80 across performance, accessibility, best-practices, SEO." },
            { id: "pf-2", label: "LCP under 2.5s on a throttled 4G connection." },
            { id: "pf-3", label: "Images use next-gen formats and lazy-loading." },
            { id: "pf-4", label: "Fonts subset / preloaded; no FOUT on critical text." },
            { id: "pf-5", label: "Caching headers and CDN configured." },
          ],
        },
        {
          title: "Backups & rollback",
          items: [
            { id: "bk-1", label: "Database backup taken immediately before launch." },
            { id: "bk-2", label: "Previous deploy retained for instant rollback." },
            { id: "bk-3", label: "DNS TTLs lowered before launch and restored after." },
            { id: "bk-4", label: "Status page or comms channel ready for incident updates." },
          ],
        },
      ]}
    />
  );
}
