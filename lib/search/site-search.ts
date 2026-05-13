import { TOP_BAR_LINKS } from "@/lib/navigation/app-menu";
import {
  uniqueSiteTools,
  SITE_SEARCH_TOOLKIT_FILTERS,
  DASHBOARD_SECTION_META,
  type SiteTool,
  type ToolkitSearchFilter,
} from "@/lib/tools/site-catalog";
import { MARKETING_TOOLS } from "@/lib/marketing-tools/catalog";
import { SEARCH_INDEX_ICON_ENTRIES } from "@/lib/data/searchIndex";

export type SearchToolType = "hub" | "tool" | "page" | "dashboard" | "marketing" | "auth";

export interface SiteSearchEntry {
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  toolType: SearchToolType;
  /** Portfolio-area filters (subset of `ToolkitSearchFilter`, never includes `all`). */
  toolkitAreas: ToolkitSearchFilter[];
  /** Phosphor icon component name for palette rows (optional). */
  icon?: string;
}

const SUPPLEMENT: SiteSearchEntry[] = [
  {
    title: "Homepage toolkit dashboard",
    description: "Category columns, featured modules, and stats on the SecureScope landing page.",
    category: "Page sections",
    tags: ["home", "portfolio", "toolkit", "categories", "landing"],
    url: "/#portfolio-toolkit",
    toolType: "page",
    toolkitAreas: [],
  },
  {
    title: "Threat lookup hero",
    description: "Jump to the IP, domain, and URL lookup bar on the home page.",
    category: "Page sections",
    tags: ["lookup", "search", "hero", "virustotal"],
    url: "/#search-section",
    toolType: "page",
    toolkitAreas: ["Cybersecurity"],
  },
  {
    title: "Sign in",
    description: "Access dashboards, saved scans and alerts.",
    category: "Auth",
    tags: ["login", "account", "session"],
    url: "/login",
    toolType: "auth",
    toolkitAreas: [],
  },
  {
    title: "Forgot password",
    description: "Request a secure password reset link (email in production, dev console locally).",
    category: "Auth",
    tags: ["password", "reset", "recovery", "login"],
    url: "/forgot-password",
    toolType: "auth",
    toolkitAreas: [],
  },
  {
    title: "Encrypted vault",
    description: "Editors and admins: client-side encryption for browser scan history.",
    category: "Dashboard",
    tags: ["vault", "encryption", "localstorage", "aes", "pbkdf2"],
    url: "/dashboard/vault",
    toolType: "dashboard",
    toolkitAreas: ["Cybersecurity"],
  },
  {
    title: "User management",
    description: "Admin-only directory, roles, and account status (demo in-memory store).",
    category: "Administration",
    tags: ["users", "rbac", "admin", "roles"],
    url: "/dashboard/admin/users",
    toolType: "dashboard",
    toolkitAreas: [],
  },
  {
    title: "Create account",
    description: "Register for SecureScope workspace access.",
    category: "Auth",
    tags: ["signup", "register", "account"],
    url: "/signup",
    toolType: "auth",
    toolkitAreas: [],
  },
  {
    title: "Security checklist",
    description: "HTTPS, API secrets, optional client-side encrypted history, security headers, forms, and storage guidance.",
    category: "Resources",
    tags: ["security", "csp", "hsts", "encryption", "headers", "compliance", "checklist"],
    url: "/security",
    toolType: "page",
    toolkitAreas: ["Cybersecurity"],
  },
  {
    title: "Site search",
    description: "Full-text search with category filters across every tool and hub.",
    category: "Top navigation",
    tags: ["search", "find", "filter", "browse"],
    url: "/search",
    toolType: "page",
    toolkitAreas: ["IT tools"],
  },
  {
    title: "Toolkit roadmap",
    description: "Coming-soon and preview modules from the security suite grid.",
    category: "Tools",
    tags: ["roadmap", "coming soon", "preview", "planned"],
    url: "/tools/coming-soon",
    toolType: "tool",
    toolkitAreas: ["Cybersecurity"],
  },
];

const POPULAR_HREFS = [
  "/tools",
  "/tools/browse",
  "/tools/domain-lookup",
  "/tools/automated-monitoring",
  "/marketing-tools",
  "/tools/ai-assistant",
  "/dashboard",
  "/automation-tools",
  "/web-tools",
  "/search",
  "/resources",
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
  if (href.startsWith("/login") || href.startsWith("/signup") || href.startsWith("/forgot-password") || href.startsWith("/reset-password")) {
    return "auth";
  }
  if (href === "/security") return "page";
  if (href.startsWith("/resources") || href.startsWith("/projects/")) return "page";
  if (href === "/search") return "page";
  if (href.startsWith("/tools/marketing") || href === "/marketing-tools") return "marketing";
  if (
    href.endsWith("-tools") ||
    href === "/tools" ||
    href === "/tools/browse" ||
    href === "/pricing" ||
    href === "/enterprise" ||
    href === "/projects" ||
    href === "/contact" ||
    href === "/about" ||
    href === "/reporting-tools" ||
    href === "/business-tools" ||
    href === "/lead-tools" ||
    href === "/domain-ip-tools" ||
    href === "/web-tools" ||
    href === "/cyber-tools" ||
    href === "/coding-tools" ||
    href === "/automation-tools" ||
    href === "/m365-tools" ||
    href === "/it-admin-tools"
  )
    return "hub";
  return "tool";
}

function pushDeduped(map: Map<string, SiteSearchEntry>, entry: SiteSearchEntry) {
  const prev = map.get(entry.url);
  if (!prev) {
    map.set(entry.url, {
      ...entry,
      tags: [...new Set(entry.tags)],
      toolkitAreas: [...new Set(entry.toolkitAreas)],
    });
    return;
  }
  const tags = new Set([...prev.tags, ...entry.tags]);
  const toolkitAreas = new Set([...prev.toolkitAreas, ...entry.toolkitAreas]);
  map.set(entry.url, {
    ...prev,
    description: prev.description.length >= entry.description.length ? prev.description : entry.description,
    tags: [...tags],
    toolkitAreas: [...toolkitAreas],
    icon: prev.icon ?? entry.icon,
  });
}

function fromSiteTool(t: SiteTool): SiteSearchEntry {
  const sectionLabel = DASHBOARD_SECTION_META[t.dashboardSection]?.label ?? "";
  return {
    title: t.label,
    description: t.description,
    category: t.megaGroup,
    tags: [
      ...t.keywords,
      ...slugifyTags(t.label, t.description, t.href.replace(/^\//, ""), sectionLabel, t.dashboardSection),
    ],
    url: t.href,
    toolType: inferToolType(t.href),
    toolkitAreas: [...t.toolkitFilters],
  };
}

function buildIndex(): SiteSearchEntry[] {
  const map = new Map<string, SiteSearchEntry>();

  for (const link of TOP_BAR_LINKS) {
    pushDeduped(map, {
      title: link.label,
      description: link.description ?? "",
      category: "Top navigation",
      tags: slugifyTags(link.label, link.description ?? "", "navigation"),
      url: link.href,
      toolType: inferToolType(link.href),
      toolkitAreas: link.href === "/automation-tools" ? (["Automation"] as ToolkitSearchFilter[]) : [],
    });
  }

  for (const t of uniqueSiteTools()) {
    pushDeduped(map, fromSiteTool(t));
  }

  for (const tool of MARKETING_TOOLS) {
    pushDeduped(map, {
      title: tool.name,
      description: tool.description,
      category: "Marketing Tools",
      tags: slugifyTags(tool.name, tool.description, tool.slug, tool.categoryId),
      url: tool.href,
      toolType: "marketing",
      toolkitAreas: ["Marketing"],
    });
  }

  for (const row of SUPPLEMENT) {
    pushDeduped(map, row);
  }

  for (const row of SEARCH_INDEX_ICON_ENTRIES) {
    pushDeduped(map, {
      title: row.title,
      description: row.description,
      category: row.category,
      tags: [...row.keywords, ...slugifyTags(row.title, row.description, row.url)],
      url: row.url,
      toolType: inferToolType(row.url),
      toolkitAreas: row.toolkitAreas ?? [],
      icon: row.icon,
    });
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

export const SEARCH_TOOLKIT_AREA_FILTERS = [...SITE_SEARCH_TOOLKIT_FILTERS] as const;

export type SearchToolkitAreaFilter = (typeof SEARCH_TOOLKIT_AREA_FILTERS)[number];

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
  const curated = POPULAR_HREFS.map((h) => map.get(h)).filter(Boolean) as SiteSearchEntry[];
  if (curated.length > 0) return curated;
  return SITE_SEARCH_INDEX.slice(0, 10);
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
  const areaStr = normalize(e.toolkitAreas.join(" "));
  const tagStr = normalize(e.tags.join(" "));
  const url = normalize(e.url);
  const urlPath = url.replace(/^https?:\/\/[^/]+/i, "");
  const pathTail = urlPath.includes("/") ? urlPath.slice(urlPath.lastIndexOf("/") + 1) : urlPath;

  if (title === n || url === `/${n}` || url.endsWith(`/${n}`)) return 120;
  if (pathTail.includes(n) && n.length >= 3) return 102;
  if (urlPath.includes(`/${n}/`) || urlPath.includes(`/${n}?`)) return 100;
  if (n.length >= 3 && url.includes(n.replace(/\s+/g, ""))) return 88;
  if (title.startsWith(n)) return 105;
  if (title.includes(n)) return 95;
  if (desc.includes(n)) return 80;
  if (cat.includes(n)) return 72;
  if (areaStr.includes(n)) return 70;
  if (tagStr.includes(n)) return 68;

  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    let tScore = 0;
    for (const t of tokens) {
      if (title.includes(t) || desc.includes(t) || tagStr.includes(t) || areaStr.includes(t)) tScore += 18;
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
  toolkitArea?: SearchToolkitAreaFilter;
  limit?: number;
}

export function searchSite(opts: SearchOptions): SiteSearchEntry[] {
  try {
    const limit = opts.limit ?? 40;
    const q = opts.query.trim();
    const cat = opts.category;
    const tt = opts.toolType;
    const area = opts.toolkitArea ?? "all";

    let pool = SITE_SEARCH_INDEX;
    if (cat !== "all") {
      pool = pool.filter((e) => e.category === cat);
    }
    if (tt !== "all") {
      pool = pool.filter((e) => e.toolType === tt);
    }
    if (area !== "all") {
      pool = pool.filter((e) => e.toolkitAreas.includes(area));
    }

    if (!q) {
      return pool.slice(0, limit);
    }

    const scored = pool
      .map((e) => ({ e, s: scoreEntry(q, e) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title));

    return scored.slice(0, limit).map((x) => x.e);
  } catch {
    return [];
  }
}

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
