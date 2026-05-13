/**
 * Tracks recently opened tool pages in the browser for mega menu / stats.
 * Keys are intentionally namespaced; safe to clear from devtools.
 */

export const TOOL_NAV_STORAGE_KEY = "ss_platform_tool_nav_v1";

export type ToolNavEntry = { href: string; title: string; at: number };

type Stored = { recent: ToolNavEntry[]; pinned: string[] };

const MAX_RECENT = 12;

function read(): Stored {
  if (typeof window === "undefined") return { recent: [], pinned: [] };
  try {
    const raw = window.localStorage.getItem(TOOL_NAV_STORAGE_KEY);
    if (!raw) return { recent: [], pinned: [] };
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return { recent: [], pinned: [] };
    const recent = Array.isArray((p as Stored).recent) ? (p as Stored).recent : [];
    const pinned = Array.isArray((p as Stored).pinned) ? (p as Stored).pinned : [];
    return {
      recent: recent
        .filter((r): r is ToolNavEntry => typeof r?.href === "string" && typeof r?.title === "string" && typeof r?.at === "number")
        .slice(0, MAX_RECENT),
      pinned: pinned.filter((x): x is string => typeof x === "string").slice(0, 24),
    };
  } catch {
    return { recent: [], pinned: [] };
  }
}

function write(data: Stored) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOOL_NAV_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

/** Call on client when pathname is a tool route. */
export function recordToolPageView(href: string, title?: string | null) {
  if (typeof window === "undefined") return;
  if (!href.startsWith("/tools") && !href.endsWith("-tools") && href !== "/web-tools" && href !== "/marketing-tools") return;
  const t = title?.trim() || href;
  const { recent, pinned } = read();
  const next = [{ href, title: t, at: Date.now() }, ...recent.filter((r) => r.href !== href)].slice(0, MAX_RECENT);
  write({ recent: next, pinned });
}

export function getRecentToolNav(): ToolNavEntry[] {
  return read().recent;
}

export function getPinnedToolHrefs(): string[] {
  return read().pinned;
}
