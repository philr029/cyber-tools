export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  /** ISO date for sorting */
  dateIso: string;
  readingMinutes: number;
  /** Plain paragraphs for the article body */
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-i-built-cyber-tools-dashboard",
    title: "How I Built My Cyber Tools Dashboard",
    excerpt: "From catalog-driven navigation to glass UI — the architecture choices behind SecureScope.",
    category: "Engineering",
    date: "May 8, 2026",
    dateIso: "2026-05-08",
    readingMinutes: 8,
    body: [
      "SecureScope started as a single Next.js surface where I could ship real IT workflows without standing up a dozen microsites. The App Router keeps each tool route isolated while sharing one design system.",
      "The hardest part was consistency: one source of truth for the toolkit (`site-catalog`) powers browse pages, search, and the mega menu. When a route exists in the filesystem, it should be discoverable in navigation — that rule saves future me from orphan pages.",
      "Glass panels and motion are intentionally restrained. Apple-inspired polish means generous spacing, soft gradients, and animations that never fight the content.",
    ],
  },
  {
    slug: "why-dns-email-security-matter",
    title: "Why DNS and Email Security Checks Matter",
    excerpt: "SPF, DKIM, and DMARC are boring until a domain is spoofed. Here is how I use repeatable checks in tenant work.",
    category: "Security",
    date: "May 5, 2026",
    dateIso: "2026-05-05",
    readingMinutes: 6,
    body: [
      "Most business email still depends on DNS records you cannot see from the inbox. Misaligned MX, relaxed SPF, or missing DMARC alignment are the fastest path to phishing success.",
      "I reach for MX + TXT passes early in onboarding and after any DNS provider change. The tools here are checklists and lookups — they document intent, not a vendor guarantee.",
      "Pair DNS review with header analysis on suspicious messages. Together they tell a story: did the message authenticate, and did it follow the path you expected?",
    ],
  },
  {
    slug: "automating-website-form-testing",
    title: "Automating Website and Form Testing",
    excerpt: "Structured passes for forms, lead flows, and monitoring hooks — before you wire a full browser farm.",
    category: "Automation",
    date: "May 2, 2026",
    dateIso: "2026-05-02",
    readingMinutes: 7,
    body: [
      "Form regressions are rarely about HTML validation alone. Analytics events, consent banners, and redirect chains all break silently.",
      "I use planner-style checklists first: what must be true on submit, what telemetry should fire, and what the thank-you path must prove. Automation comes later once the contract is explicit.",
      "The monitoring hub in this project is the natural home for recurring checks — DNS, uptime, and scripted smoke — once server-side schedules are connected.",
    ],
  },
  {
    slug: "beginner-m365-security-guide",
    title: "Beginner Guide to Microsoft 365 Security",
    excerpt: "A gentle sequence: identity, mail flow, devices, and logging — without drowning in SKUs.",
    category: "Microsoft 365",
    date: "Apr 28, 2026",
    dateIso: "2026-04-28",
    readingMinutes: 10,
    body: [
      "Start with identity: MFA, privileged access, and break-glass accounts. If those wobble, every downstream control is shaky.",
      "Mail flow is next: forwarding rules, connector hygiene, and phishing policies. The Defender baseline prompts in this toolkit mirror conversations I have with tenants.",
      "Devices finish the triangle: Intune enrollment, encryption, and update channels. Security is a system, not a single SKU.",
    ],
  },
  {
    slug: "building-portfolio-with-real-it-tools",
    title: "Building a Portfolio with Real IT Tools",
    excerpt: "Why shipping usable utilities beats another generic landing page for hiring managers who actually read GitHub.",
    category: "Career",
    date: "Apr 22, 2026",
    dateIso: "2026-04-22",
    readingMinutes: 5,
    body: [
      "Recruiters skim, but senior engineers dig. A live toolkit demonstrates taste in UX, boundaries in API design, and discipline in TypeScript.",
      "I keep billing and secrets out of the client bundle. The portfolio story is honest: this is a workspace shell with room to harden, not a fake enterprise product.",
      "If you are building something similar, optimise for clarity and deployability. A clean Vercel deploy beats a novel architecture every time.",
    ],
  },
];

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function blogPostsSorted(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1));
}
