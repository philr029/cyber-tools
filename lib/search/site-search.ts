import { NAV_GROUPS, TOP_BAR_LINKS, type NavGroup, type NavLink } from "@/app/components/nav/nav-data";
import { MARKETING_TOOLS } from "@/lib/marketing-tools/catalog";

export type SearchToolType = "hub" | "tool" | "page" | "dashboard" | "marketing" | "auth";

export interface SiteSearchEntry {
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  toolType: SearchToolType;
}

const SUPPLEMENT: SiteSearchEntry[] = [
  {
    title: "URL Analysis",
    description: "Deep link analysis with redirect and reputation context.",
    category: "Website Tools",
    tags: ["url", "analysis", "redirect", "link"],
    url: "/tools/url-analysis",
    toolType: "tool",
  },
  {
    title: "Threat Score",
    description: "Composite risk scoring for domains and URLs.",
    category: "IT & Security Tools",
    tags: ["threat", "risk", "score", "domain"],
    url: "/tools/threat-score",
    toolType: "tool",
  },
  {
    title: "Sign in",
    description: "Access dashboards, saved scans and alerts.",
    category: "Auth",
    tags: ["login", "account", "session"],
    url: "/login",
    toolType: "auth",
  },
  {
    title: "Create account",
    description: "Register for SecureScope workspace access.",
    category: "Auth",
    tags: ["signup", "register", "account"],
    url: "/signup",
    toolType: "auth",
  },
];

const POPULAR_HREFS = [
  "/tools",
  "/tools/domain-lookup",
  "/tools/automated-monitoring",
  "/marketing-tools",
  "/tools/ai-assistant",
  "/dashboard",
  "/automation-tools",
  "/web-tools",
];

function slugifyTags(...parts: string[]): string[] {
  const out = new Set<string>();
  for (const p of parts) {
    for (const raw of p.toLowerCase().split(/[^a-z0-9]+/i)) {
      const t = raw.trim();
      if (t.length > 1) out.add(t);
    }
  }
  return [...out];
}

function inferToolType(href: string): SearchToolType {
  if (href.startsWith("/dashboard")) return "dashboard";
  if (href.startsWith("/login") || href.startsWith("/signup")) return "auth";
  if (href.startsWith("/tools/marketing") || href === "/marketing-tools") return "marketing";
  if (
    href.endsWith("-tools") ||
    href === "/tools" ||
    href === "/pricing" ||
    href === "/enterprise" ||
    href === "/projects" ||
    href === "/contact" ||
    href === "/about"
  )
    return "hub";
  return "tool";
}

function pushDeduped(map: Map<string, SiteSearchEntry>, entry: SiteSearchEntry) {
  const prev = map.get(entry.url);
  if (!prev) {
    map.set(entry.url, { ...entry, tags: [...new Set(entry.tags)] });
    return;
  }
  const tags = new Set([...prev.tags, ...entry.tags]);
  map.set(entry.url, {
    ...prev,
    description: prev.description.length >= entry.description.length ? prev.description : entry.description,
    tags: [...tags],
  });
}

function fromNavLink(link: NavLink, category: string): SiteSearchEntry {
  return {
    title: link.label,
    description: link.description ?? "",
    category,
    tags: slugifyTags(link.label, link.description ?? "", category),
    url: link.href,
    toolType: inferToolType(link.href),
  };
}

function fromNavGroup(group: NavGroup): SiteSearchEntry[] {
  const rows: SiteSearchEntry[] = [];
  rows.push({
    title: `${group.label} hub`,
    description: group.tagline ?? `Browse everything in ${group.label}.`,
    category: group.label,
    tags: slugifyTags(group.label, group.tagline ?? "", group.index),
    url: group.index,
    toolType: inferToolType(group.index),
  });
  for (const link of group.links) {
    rows.push(fromNavLink(link, group.label));
  }
  return rows;
}

function buildIndex(): SiteSearchEntry[] {
  const map = new Map<string, SiteSearchEntry>();

  for (const link of TOP_BAR_LINKS) {
    pushDeduped(map, fromNavLink(link, "Top navigation"));
  }

  for (const group of NAV_GROUPS) {
    for (const row of fromNavGroup(group)) {
      pushDeduped(map, row);
    }
  }

  for (const tool of MARKETING_TOOLS) {
    pushDeduped(map, {
      title: tool.name,
      description: tool.description,
      category: "Marketing Tools",
      tags: slugifyTags(tool.name, tool.description, tool.slug, tool.categoryId),
      url: tool.href,
      toolType: "marketing",
    });
  }

  for (const row of SUPPLEMENT) {
    pushDeduped(map, row);
  }

  return [...map.values()];
}

export const SITE_SEARCH_INDEX: SiteSearchEntry[] = buildIndex();

const UNIQUE_CATEGORIES = Array.from(new Set(SITE_SEARCH_INDEX.map((e) => e.category))).sort((a, b) =>
  a.localeCompare(b),
);

export const SEARCH_CATEGORIES = ["all", ...UNIQUE_CATEGORIES];

export type SearchCategoryFilter = (typeof SEARCH_CATEGORIES)[number];

export const SEARCH_TOOL_TYPES: SearchToolType[] = ["hub", "tool", "page", "dashboard", "marketing", "auth"];

const RECENT_KEY = "ss_search_recent_v1";

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, 8);
  } catch {
    return [];
  }
}

export function rememberSearchVisit(url: string) {
  if (typeof window === "undefined") return;
  try {
    const prev = readRecentSearches().filter((u) => u !== url);
    prev.unshift(url);
    localStorage.setItem(RECENT_KEY, JSON.stringify(prev.slice(0, 8)));
  } catch {
    /* ignore */
  }
}

export function popularEntries(): SiteSearchEntry[] {
  const map = new Map(SITE_SEARCH_INDEX.map((e) => [e.url, e]));
  return POPULAR_HREFS.map((h) => map.get(h)).filter(Boolean) as SiteSearchEntry[];
}

export function entriesForUrls(urls: string[]): SiteSearchEntry[] {
  const map = new Map(SITE_SEARCH_INDEX.map((e) => [e.url, e]));
  return urls.map((u) => map.get(u)).filter(Boolean) as SiteSearchEntry[];
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Lightweight subsequence fuzzy score in [0,1]. */
function fuzzyRatio(needle: string, hay: string): number {
  if (!needle) return 1;
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) {
    if (hay[j] === needle[i]) i++;
  }
  return i / needle.length;
}

function scoreEntry(q: string, e: SiteSearchEntry): number {
  if (!q) return 0;
  const n = normalize(q);
  const title = normalize(e.title);
  const desc = normalize(e.description);
  const cat = normalize(e.category);
  const tagStr = normalize(e.tags.join(" "));
  const url = normalize(e.url);

  if (title === n || url === `/${n}` || url.endsWith(`/${n}`)) return 120;
  if (title.startsWith(n)) return 105;
  if (title.includes(n)) return 95;
  if (desc.includes(n)) return 80;
  if (cat.includes(n)) return 72;
  if (tagStr.includes(n)) return 68;

  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    let tScore = 0;
    for (const t of tokens) {
      if (title.includes(t) || desc.includes(t) || tagStr.includes(t)) tScore += 18;
    }
    if (tScore > 0) return Math.min(88, tScore);
  }

  const fr = 0.55 * fuzzyRatio(n, title) + 0.25 * fuzzyRatio(n, desc) + 0.2 * fuzzyRatio(n, tagStr);
  if (fr >= 0.85) return 55 + Math.round(fr * 10);
  return 0;
}

export interface SearchOptions {
  query: string;
  category: SearchCategoryFilter;
  toolType: SearchToolType | "all";
  limit?: number;
}

export function searchSite(opts: SearchOptions): SiteSearchEntry[] {
  const limit = opts.limit ?? 40;
  const q = opts.query.trim();
  const cat = opts.category;
  const tt = opts.toolType;

  let pool = SITE_SEARCH_INDEX;
  if (cat !== "all") {
    pool = pool.filter((e) => e.category === cat);
  }
  if (tt !== "all") {
    pool = pool.filter((e) => e.toolType === tt);
  }

  if (!q) {
    return pool.slice(0, limit);
  }

  const scored = pool
    .map((e) => ({ e, s: scoreEntry(q, e) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title));

  return scored.slice(0, limit).map((x) => x.e);
}

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
