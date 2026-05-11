import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Web Tools — SecureScope Toolkit",
  description: "Website testing, status, redirect, broken link, meta, page speed and form QA tools.",
};

export default function WebToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Web tools"
      title="Website Testing & QA"
      intro="A focused set of tools and checklists for verifying any website end-to-end — uptime, redirects, broken links, metadata, mobile, performance, and forms."
      tools={[
        {
          href: "/tools/launch-checklist",
          title: "Website Launch Checklist",
          description: "Pre-launch sweep across SEO, analytics, forms, SSL, mobile, accessibility, performance and backups.",
          badge: "Checklist",
          why: "Catches the basics that cause most launch incidents.",
          skill: "Release management.",
        },
        {
          href: "/tools/form-test-plan",
          title: "Form Test Plan Generator",
          description: "Regression-ready test plan for any web form — happy path, validation, security and accessibility cases.",
          badge: "Generator",
          why: "Forms are the #1 silent revenue leak — a repeatable plan catches regressions.",
          skill: "Web QA, accessibility.",
        },
        {
          href: "/tools/website-status",
          title: "Website Status Checker",
          description: "Ping a URL and get HTTP status, latency, and basic headers right in your browser.",
          badge: "Live",
          why: "Confirms a site is reachable before deeper checks.",
          skill: "Frontend networking, fetch, browser limitations.",
        },
        {
          href: "/tools/redirect-trace",
          title: "URL Redirect Tracer",
          description: "Follow every hop in a redirect chain and inspect each Location header.",
          badge: "Live",
          why: "Catches redirect loops, marketing UTM strippers, and broken canonical URLs.",
          skill: "HTTP, server-side fetch with SSRF protection.",
        },
        {
          href: "/tools/broken-links",
          title: "Broken Link Checker",
          description: "Paste a list of URLs and check each for HTTP errors and unreachable hosts.",
          badge: "Demo",
          why: "Pre-launch sanity check for marketing pages with many outbound links.",
          skill: "Bulk URL validation, CORS pitfalls.",
        },
        {
          href: "/tools/meta-preview",
          title: "Meta Title & Description Preview",
          description: "Live SERP and social-card preview as you tune <title>, description, and Open Graph metadata.",
          badge: "Live",
          why: "SEO and social CTR depend on getting these exactly right.",
          skill: "HTML metadata, OG / Twitter cards.",
        },
        {
          href: "/tools/page-speed-checklist",
          title: "Page Speed Checklist",
          description: "Hit good Core Web Vitals scores — images, fonts, scripts, caching, and measurement.",
          badge: "Checklist",
          why: "Performance still moves the SEO and conversion needle.",
          skill: "Web performance fundamentals.",
        },
        {
          href: "/tools/mobile-responsiveness",
          title: "Mobile Responsiveness Checklist",
          description: "Verify layouts hold up at every realistic mobile width, not just 375/768/1280.",
          badge: "Checklist",
          why: "Catches the awkward in-between viewports most teams forget.",
          skill: "Responsive design, mobile UX.",
        },
        {
          href: "/tools/form-testing-checklist",
          title: "Form Testing Checklist",
          description: "Regression checklist for any HTML form — validation, edge cases, accessibility, analytics.",
          badge: "Checklist",
          why: "Forms break quietly and lose revenue.",
          skill: "Web QA, accessibility.",
        },
        {
          href: "/tools/form-tester",
          title: "Form Tester (server relay)",
          description: "Submit a form through SecureScope's hardened relay and inspect the response.",
          badge: "Live",
          why: "Confirms server-side handling without exposing your local browser.",
          skill: "Secure relay, CSRF / redirect auditing.",
        },
      ]}
    />
  );
}
