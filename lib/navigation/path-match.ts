import type { NavGroup } from "@/lib/tools/site-catalog";

export function navLinkMatchesPath(path: string, href: string) {
  const base = href.split("?")[0] ?? href;
  if (path === href || path === base) return true;
  if (base.length > 1 && path.startsWith(`${base}/`)) return true;
  return false;
}

export function navGroupContainsPath(g: NavGroup, path: string) {
  if (path === g.index || path.startsWith(`${g.index}/`)) return true;
  return g.links.some((l) => navLinkMatchesPath(path, l.href));
}
