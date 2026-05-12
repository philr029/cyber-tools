import type { MarketingCategory, MarketingCategoryId, MarketingToolDef, MarketingToolStatus } from "./types";

export const MARKETING_CATEGORIES: MarketingCategory[] = [
  {
    id: "seo",
    label: "SEO Tools",
    shortLabel: "SEO",
    description: "Search visibility, metadata, crawling and technical SEO helpers.",
  },
  {
    id: "content",
    label: "Content Marketing",
    shortLabel: "Content",
    description: "Ideation, outlines, repurposing and editorial planning.",
  },
  {
    id: "social",
    label: "Social Media",
    shortLabel: "Social",
    description: "Captions, calendars, hooks and channel-specific copy.",
  },
  {
    id: "email",
    label: "Email Marketing",
    shortLabel: "Email",
    description: "Subject lines, sequences, CTAs and deliverability checks.",
  },
  {
    id: "paid",
    label: "Paid Ads",
    shortLabel: "Paid",
    description: "Ad copy, budgets, bidding math and campaign structure.",
  },
  {
    id: "branding",
    label: "Branding",
    shortLabel: "Brand",
    description: "Voice, positioning, messaging and visual direction starters.",
  },
  {
    id: "website",
    label: "Website Marketing",
    shortLabel: "Website",
    description: "Landing pages, trust, forms and on-site conversion.",
  },
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "Analytics",
    description: "Tracking links, KPIs, ROI and reporting workflows.",
  },
  {
    id: "local",
    label: "Local Business",
    shortLabel: "Local",
    description: "Maps, reviews, citations and hyper-local campaigns.",
  },
  {
    id: "ai",
    label: "AI Marketing Assistant",
    shortLabel: "AI",
    description: "Strategy, journeys, funnels and automation sketches.",
  },
];

const CS = (slug: string) => `/tools/marketing/coming-soon?slug=${encodeURIComponent(slug)}`;

function t(
  id: string,
  slug: string,
  name: string,
  description: string,
  categoryId: MarketingCategoryId,
  status: MarketingToolStatus,
  href: string,
  featured?: boolean,
): MarketingToolDef {
  return { id, slug, name, description, categoryId, status, href, featured };
}

export const FEATURED_TOOL_ORDER = [
  "utm-builder",
  "blog-title-generator",
  "seo-page-audit-checklist",
  "subject-line-generator",
  "roas-calculator",
  "linkedin-post-generator",
] as const;

export const MARKETING_TOOLS: MarketingToolDef[] = [
  t("seo-meta-title", "meta-title-description-checker", "Meta Title & Description Checker", "Tune page titles and descriptions with live length guidance.", "seo", "live", "/tools/meta-preview"),
  t("seo-keyword", "keyword-idea-generator", "Keyword Idea Generator", "Seed topics into grouped keyword angles for pages and clusters.", "seo", "beta", CS("keyword-idea-generator")),
  t("seo-audit", "seo-page-audit-checklist", "SEO Page Audit Checklist", "Structured pass for indexability, content, links and snippets.", "seo", "coming-soon", CS("seo-page-audit-checklist")),
  t("seo-heading", "heading-structure-checker", "Heading Structure Checker", "Validate H1–H3 hierarchy and skim readability before publish.", "seo", "coming-soon", CS("heading-structure-checker")),
  t("seo-broken", "broken-link-checker-ui", "Broken Link Checker UI", "Paste URLs to spot 404s and transport errors from the browser.", "seo", "live", "/tools/broken-links"),
  t("seo-sitemap", "sitemap-checker", "Sitemap Checker", "Sanity-check sitemap URLs, duplicates and lastmod freshness.", "seo", "live", "/tools/sitemap-checker"),
  t("seo-robots", "robots-txt-checker", "Robots.txt Checker", "Interpret rules, disallows and crawl budget implications.", "seo", "beta", "/tools/preview/robots-txt-checker"),
  t("seo-schema", "schema-markup-generator", "Schema Markup Generator", "JSON-LD starters for Article, FAQ, Product and Organization.", "seo", "coming-soon", CS("schema-markup-generator")),
  t("seo-serp", "serp-preview-tool", "SERP Preview Tool", "Preview how titles and descriptions render in search results.", "seo", "live", "/tools/meta-preview"),
  t("seo-alt", "image-alt-text-checker", "Image Alt Text Checker", "Checklist-driven pass for meaningful, concise alt copy.", "seo", "coming-soon", CS("image-alt-text-checker")),

  t("c-blog-title", "blog-title-generator", "Blog Title Generator", "Angles, brackets and curiosity-led titles from a single brief.", "content", "live", "/tools/marketing/blog-title-generator", true),
  t("c-outline", "blog-outline-generator", "Blog Outline Generator", "H2/H3 skeletons with proof points and CTA placement.", "content", "coming-soon", CS("blog-outline-generator")),
  t("c-social", "social-post-generator", "Social Post Generator", "Multi-channel variants from one core message.", "content", "live", "/tools/social-post-generator"),
  t("c-news", "email-newsletter-generator", "Email Newsletter Generator", "Sections, tone and sponsor slots for recurring sends.", "content", "coming-soon", CS("email-newsletter-generator")),
  t("c-cal", "content-calendar-planner", "Content Calendar Planner", "Themes, owners and weekly rhythm for editorial teams.", "content", "coming-soon", CS("content-calendar-planner")),
  t("c-case", "case-study-generator", "Case Study Generator", "Challenge–solution–outcome narrative with metrics prompts.", "content", "coming-soon", CS("case-study-generator")),
  t("c-lp", "landing-page-copy-generator", "Landing Page Copy Generator", "Hero, benefits, objection handling and sticky CTAs.", "content", "coming-soon", CS("landing-page-copy-generator")),
  t("c-faq", "faq-generator", "FAQ Generator", "Customer questions grouped by funnel stage.", "content", "coming-soon", CS("faq-generator")),
  t("c-tone", "tone-of-voice-rewriter", "Tone of Voice Rewriter", "Shift copy between formal, friendly, bold or minimal.", "content", "coming-soon", CS("tone-of-voice-rewriter")),
  t("c-repurp", "content-repurposing-tool", "Content Repurposing Tool", "Turn one asset into clips, carousels, threads and snippets.", "content", "coming-soon", CS("content-repurposing-tool")),

  t("s-li", "linkedin-post-generator", "LinkedIn Post Generator", "Professional hooks, line breaks and CTA tailored to your goal.", "social", "live", "/tools/marketing/linkedin-post-generator", true),
  t("s-fb", "facebook-ad-copy-generator", "Facebook Ad Copy Generator", "Primary text, headline and description packs for Meta ads.", "social", "coming-soon", CS("facebook-ad-copy-generator")),
  t("s-ig", "instagram-caption-generator", "Instagram Caption Generator", "Short hooks, line breaks and soft CTAs for feed and Reels.", "social", "coming-soon", CS("instagram-caption-generator")),
  t("s-tt", "tiktok-hook-generator", "TikTok Hook Generator", "Pattern-interrupt openers for the first 1–3 seconds.", "social", "coming-soon", CS("tiktok-hook-generator")),
  t("s-hash", "hashtag-generator", "Hashtag Generator", "Blend reach, niche and branded tags without stuffing.", "social", "coming-soon", CS("hashtag-generator")),
  t("s-cal", "social-media-calendar", "Social Media Calendar", "Weekly grid with formats, owners and asset links.", "social", "coming-soon", CS("social-media-calendar")),
  t("s-eng", "engagement-rate-calculator", "Engagement Rate Calculator", "ER from followers and interactions across posts.", "social", "coming-soon", CS("engagement-rate-calculator")),
  t("s-idea", "post-idea-generator", "Post Idea Generator", "Themes, prompts and series concepts per channel.", "social", "coming-soon", CS("post-idea-generator")),
  t("s-pack", "campaign-caption-pack-generator", "Campaign Caption Pack Generator", "Cohesive multi-post storyline for launches.", "social", "coming-soon", CS("campaign-caption-pack-generator")),
  t("s-comp", "competitor-post-tracker-ui", "Competitor Post Tracker UI", "Lightweight log for cadence, themes and engagement signals.", "social", "coming-soon", CS("competitor-post-tracker-ui")),

  t("e-subj", "subject-line-generator", "Subject Line Generator", "Ten inbox-tested angles with length awareness.", "email", "live", "/tools/marketing/subject-line-generator", true),
  t("e-prev", "email-preview-text-generator", "Email Preview Text Generator", "Hidden preheader lines that complement the subject.", "email", "coming-soon", CS("email-preview-text-generator")),
  t("e-cold", "cold-email-generator", "Cold Email Generator", "Respectful outreach with proof and single CTA.", "email", "coming-soon", CS("cold-email-generator")),
  t("e-follow", "follow-up-email-generator", "Follow-up Email Generator", "Polite bump sequences after no reply.", "email", "coming-soon", CS("follow-up-email-generator")),
  t("e-plan", "email-campaign-planner", "Email Campaign Planner", "Goals, segments, cadence and success metrics.", "email", "coming-soon", CS("email-campaign-planner")),
  t("e-spam", "email-spam-word-checker", "Email Spam Word Checker", "Highlight risky phrases before you hit send.", "email", "coming-soon", CS("email-spam-word-checker")),
  t("e-cta", "cta-generator", "CTA Generator", "Action-led buttons and link lines for campaigns.", "email", "coming-soon", CS("cta-generator")),
  t("e-news", "newsletter-structure-builder", "Newsletter Structure Builder", "Intro, body blocks, sponsor and P.S. scaffold.", "email", "coming-soon", CS("newsletter-structure-builder")),
  t("e-ab", "ab-test-idea-generator", "A/B Test Idea Generator", "Hypothesis prompts for subject, creative and timing.", "email", "coming-soon", CS("ab-test-idea-generator")),
  t("e-perf", "email-performance-calculator", "Email Performance Calculator", "Open, click and conversion back-of-envelope math.", "email", "coming-soon", CS("email-performance-calculator")),

  t("p-google", "google-ads-copy-generator", "Google Ads Copy Generator", "RSA-friendly headlines and descriptions with policy awareness.", "paid", "beta", CS("google-ads-copy-generator")),
  t("p-fb", "facebook-ads-copy-generator", "Facebook Ads Copy Generator", "Angles for prospecting, remarketing and catalog sales.", "paid", "coming-soon", CS("facebook-ads-copy-generator")),
  t("p-li", "linkedin-ads-copy-generator", "LinkedIn Ads Copy Generator", "B2B lead and awareness variants with social proof.", "paid", "coming-soon", CS("linkedin-ads-copy-generator")),
  t("p-budget", "ppc-budget-calculator", "PPC Budget Calculator", "Daily caps, flighting and forecast clicks from CPC.", "paid", "coming-soon", CS("ppc-budget-calculator")),
  t("p-roas", "roas-calculator", "ROAS Calculator", "Return on ad spend with simple profit/loss readout.", "paid", "live", "/tools/marketing/roas-calculator", true),
  t("p-cpc", "cpc-calculator", "CPC Calculator", "Derive CPC from spend and clicks or reverse.", "paid", "coming-soon", CS("cpc-calculator")),
  t("p-camp", "campaign-planner", "Campaign Planner", "Objectives, audiences, creative matrix and measurement.", "paid", "coming-soon", CS("campaign-planner")),
  t("p-var", "ad-variation-generator", "Ad Variation Generator", "Systematic headline/body swaps for testing.", "paid", "coming-soon", CS("ad-variation-generator")),
  t("p-lp", "landing-page-match-checker", "Landing Page Match Checker", "Message match between ad promise and above-the-fold.", "paid", "coming-soon", CS("landing-page-match-checker")),
  t("p-match", "keyword-match-type-helper", "Keyword Match Type Helper", "Explain broad, phrase and exact with examples.", "paid", "coming-soon", CS("keyword-match-type-helper")),

  t("b-voice", "brand-voice-generator", "Brand Voice Generator", "Traits, lexicon and do/don’t language examples.", "branding", "coming-soon", CS("brand-voice-generator")),
  t("b-name", "brand-name-idea-generator", "Brand Name Idea Generator", "Memorable, pronounceable names with availability prompts.", "branding", "coming-soon", CS("brand-name-idea-generator")),
  t("b-slogan", "slogan-generator", "Slogan Generator", "Short lines with rhythm and category clarity.", "branding", "coming-soon", CS("slogan-generator")),
  t("b-val", "value-proposition-generator", "Value Proposition Generator", "For who, what outcome, why us — in one tight line.", "branding", "coming-soon", CS("value-proposition-generator")),
  t("b-usp", "usp-generator", "USP Generator", "Differentiators mapped to proof points.", "branding", "coming-soon", CS("usp-generator")),
  t("b-persona", "audience-persona-builder", "Audience Persona Builder", "Goals, pains, channels and buying triggers.", "branding", "coming-soon", CS("audience-persona-builder")),
  t("b-matrix", "competitor-positioning-matrix", "Competitor Positioning Matrix", "Axes for price, quality, speed and niche.", "branding", "coming-soon", CS("competitor-positioning-matrix")),
  t("b-mission", "mission-statement-generator", "Mission Statement Generator", "Purpose, audience and impact in two sentences.", "branding", "coming-soon", CS("mission-statement-generator")),
  t("b-colour", "colour-palette-suggestion-ui", "Colour Palette Suggestion UI", "Accessible pairings with contrast notes.", "branding", "coming-soon", CS("colour-palette-suggestion-ui")),
  t("b-msg", "brand-messaging-framework", "Brand Messaging Framework", "Pillars, proof and elevator lengths.", "branding", "coming-soon", CS("brand-messaging-framework")),

  t("w-lp", "landing-page-checklist", "Landing Page Checklist", "Hero clarity, proof, friction and mobile checks.", "website", "coming-soon", CS("landing-page-checklist")),
  t("w-cta", "cta-checker", "CTA Checker", "Visibility, copy specificity and placement audit.", "website", "coming-soon", CS("cta-checker")),
  t("w-cvr", "conversion-rate-calculator", "Conversion Rate Calculator", "Visitors to conversions with percentage readout.", "website", "live", "/tools/marketing/conversion-rate-calculator"),
  t("w-trust", "website-trust-signal-checker", "Website Trust Signal Checker", "Logos, policies, contact paths and social proof.", "website", "coming-soon", CS("website-trust-signal-checker")),
  t("w-home", "homepage-audit-tool", "Homepage Audit Tool", "First-screen clarity, navigation and primary CTA.", "website", "coming-soon", CS("homepage-audit-tool")),
  t("w-form", "form-conversion-checklist", "Form Conversion Checklist", "Fields, validation, errors and confirmation UX.", "website", "coming-soon", CS("form-conversion-checklist")),
  t("w-chat", "live-chat-script-generator", "Live Chat Script Generator", "Greetings, intents and escalation paths.", "website", "coming-soon", CS("live-chat-script-generator")),
  t("w-lead", "lead-magnet-idea-generator", "Lead Magnet Idea Generator", "Formats matched to funnel stage and channel.", "website", "coming-soon", CS("lead-magnet-idea-generator")),
  t("w-price", "pricing-page-checklist", "Pricing Page Checklist", "Tiers, comparison, FAQs and risk reversal.", "website", "coming-soon", CS("pricing-page-checklist")),
  t("w-copy", "website-copy-improvement-tool", "Website Copy Improvement Tool", "Clarity, specificity and CTA tightening prompts.", "website", "coming-soon", CS("website-copy-improvement-tool")),

  t("a-utm", "utm-builder", "UTM Builder", "Build tagged URLs for clean campaign reporting in analytics.", "analytics", "live", "/tools/marketing/utm-builder", true),
  t("a-curl", "campaign-url-builder", "Campaign URL Builder", "Structured builder for multi-parameter tracking links.", "analytics", "coming-soon", CS("campaign-url-builder")),
  t("a-dash", "marketing-kpi-dashboard-ui", "Marketing KPI Dashboard UI", "Starter layout for spend, pipeline and content metrics.", "analytics", "coming-soon", CS("marketing-kpi-dashboard-ui")),
  t("a-cvr2", "analytics-conversion-rate-calculator", "Conversion Rate Calculator", "Same precise math as the website module — for funnel reviews.", "analytics", "live", "/tools/marketing/conversion-rate-calculator"),
  t("a-roi", "roi-calculator", "ROI Calculator", "Return on investment from spend and value captured.", "analytics", "coming-soon", CS("roi-calculator")),
  t("a-lead", "lead-cost-calculator", "Lead Cost Calculator", "CPL from media spend and qualified leads.", "analytics", "coming-soon", CS("lead-cost-calculator")),
  t("a-funnel", "funnel-drop-off-calculator", "Funnel Drop-off Calculator", "Stage-to-stage loss percentages.", "analytics", "coming-soon", CS("funnel-drop-off-calculator")),
  t("a-traffic", "traffic-source-tracker-ui", "Traffic Source Tracker UI", "Manual UTM discipline and source/medium hygiene.", "analytics", "coming-soon", CS("traffic-source-tracker-ui")),
  t("a-report", "monthly-marketing-report-generator", "Monthly Marketing Report Generator", "Executive summary, wins, learnings and next tests.", "analytics", "coming-soon", CS("monthly-marketing-report-generator")),
  t("a-ga4", "ga4-event-planning-tool", "GA4 Event Planning Tool", "Event names, parameters and consent notes.", "analytics", "coming-soon", CS("ga4-event-planning-tool")),

  t("l-gbp", "google-business-profile-checklist", "Google Business Profile Checklist", "Categories, attributes, photos and Q&A hygiene.", "local", "coming-soon", CS("google-business-profile-checklist")),
  t("l-seo", "local-seo-checklist", "Local SEO Checklist", "NAP, schema, landing pages and reviews.", "local", "coming-soon", CS("local-seo-checklist")),
  t("l-rev", "review-reply-generator", "Review Reply Generator", "Grateful, professional replies for common ratings.", "local", "coming-soon", CS("review-reply-generator")),
  t("l-key", "local-keyword-generator", "Local Keyword Generator", "Service + city modifiers and intent buckets.", "local", "coming-soon", CS("local-keyword-generator")),
  t("l-svc", "service-page-generator", "Service Page Generator", "Outline for trades and professional services.", "local", "coming-soon", CS("service-page-generator")),
  t("l-loc", "location-page-generator", "Location Page Generator", "Differentiated copy for multi-location brands.", "local", "coming-soon", CS("location-page-generator")),
  t("l-comp", "local-competitor-tracker-ui", "Local Competitor Tracker UI", "Map pack notes, promos and positioning.", "local", "coming-soon", CS("local-competitor-tracker-ui")),
  t("l-cit", "citation-checklist", "Citation Checklist", "Directories, consistency and monitoring cadence.", "local", "coming-soon", CS("citation-checklist")),
  t("l-test", "customer-testimonial-generator", "Customer Testimonial Generator", "Quote requests and story prompts for social proof.", "local", "coming-soon", CS("customer-testimonial-generator")),
  t("l-camp", "local-campaign-planner", "Local Campaign Planner", "Geo radius, offers and channel mix.", "local", "coming-soon", CS("local-campaign-planner")),

  t("ai-idea", "campaign-idea-generator", "Campaign Idea Generator", "Seasonal, product-led and community angles.", "ai", "coming-soon", CS("campaign-idea-generator")),
  t("ai-strat", "marketing-strategy-generator", "Marketing Strategy Generator", "Goals, ICP, channels and quarterly bets.", "ai", "coming-soon", CS("marketing-strategy-generator")),
  t("ai-launch", "product-launch-planner", "Product Launch Planner", "Teaser, waitlist, launch day and retention beats.", "ai", "coming-soon", CS("product-launch-planner")),
  t("ai-mag", "lead-magnet-generator", "Lead Magnet Generator", "Formats, titles and delivery mechanics.", "ai", "coming-soon", CS("lead-magnet-generator")),
  t("ai-journey", "customer-journey-mapper", "Customer Journey Mapper", "Stages, emotions, touchpoints and metrics.", "ai", "coming-soon", CS("customer-journey-mapper")),
  t("ai-auto", "marketing-automation-workflow-builder", "Marketing Automation Workflow Builder", "Triggers, branches and SLA-friendly waits.", "ai", "coming-soon", CS("marketing-automation-workflow-builder")),
  t("ai-funnel", "sales-funnel-builder", "Sales Funnel Builder", "TOFU–MOFU–BOFU assets and handoffs.", "ai", "coming-soon", CS("sales-funnel-builder")),
  t("ai-offer", "offer-generator", "Offer Generator", "Bonuses, guarantees and urgency without sleaze.", "ai", "coming-soon", CS("offer-generator")),
  t("ai-promo", "promotion-calendar-generator", "Promotion Calendar Generator", "Retail and SaaS promo rhythm with guardrails.", "ai", "coming-soon", CS("promotion-calendar-generator")),
  t("ai-chat", "ai-marketing-chatbot-ui", "AI Marketing Chatbot UI", "Embedded assistant layout for campaign Q&A.", "ai", "coming-soon", CS("ai-marketing-chatbot-ui")),
];

export const MARKETING_LIVE_SLUGS = [
  "utm-builder",
  "blog-title-generator",
  "subject-line-generator",
  "roas-calculator",
  "conversion-rate-calculator",
  "linkedin-post-generator",
] as const;

export type MarketingLiveSlug = (typeof MARKETING_LIVE_SLUGS)[number];

export function isMarketingLiveSlug(s: string): s is MarketingLiveSlug {
  return (MARKETING_LIVE_SLUGS as readonly string[]).includes(s);
}

export function getMarketingToolBySlug(slug: string | null | undefined): MarketingToolDef | undefined {
  if (!slug) return undefined;
  return MARKETING_TOOLS.find((x) => x.slug === slug);
}

export function marketingHubStats() {
  const total = MARKETING_TOOLS.length;
  const live = MARKETING_TOOLS.filter((x) => x.status === "live").length;
  const beta = MARKETING_TOOLS.filter((x) => x.status === "beta").length;
  const comingSoon = MARKETING_TOOLS.filter((x) => x.status === "coming-soon").length;
  const categories = MARKETING_CATEGORIES.length;
  return { total, live, beta, comingSoon, categories };
}

export function featuredMarketingTools(): MarketingToolDef[] {
  const map = new Map(MARKETING_TOOLS.map((x) => [x.slug, x]));
  return FEATURED_TOOL_ORDER.map((s) => map.get(s)).filter((x): x is MarketingToolDef => x !== undefined);
}
