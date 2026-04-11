/**
 * crt.sh provider adapter — certificate transparency subdomain enumeration.
 * Docs: https://crt.sh/
 * No API key required.
 */

import type { SubdomainResult, SubdomainEntry } from "@/lib/types";

interface CrtShEntry {
  name_value: string;
}

export async function fetchSubdomains(domain: string): Promise<SubdomainResult | null> {
  try {
    const res = await fetch(
      `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!res.ok) return null;

    const json: CrtShEntry[] = await res.json();
    if (!Array.isArray(json)) return null;

    // Collect unique subdomains, filtering out wildcards and the base domain
    const seen = new Set<string>();
    const subdomains: SubdomainEntry[] = [];

    for (const entry of json) {
      const names = entry.name_value
        .split("\n")
        .map((n) => n.trim().toLowerCase())
        .filter(Boolean);

      for (const name of names) {
        if (seen.has(name)) continue;
        seen.add(name);

        const isWildcard = name.startsWith("*.");
        const clean = isWildcard ? name.slice(2) : name;

        // Include subdomains (not just the base domain)
        if (clean !== domain && clean.endsWith(`.${domain}`)) {
          subdomains.push({ subdomain: name, isWildcard });
        }
      }
    }

    // Sort: wildcards last, then alphabetical
    subdomains.sort((a, b) => {
      if (a.isWildcard !== b.isWildcard) return a.isWildcard ? 1 : -1;
      return a.subdomain.localeCompare(b.subdomain);
    });

    return {
      domain,
      subdomains,
      totalFound: subdomains.length,
      source: "crt.sh (Certificate Transparency)",
      status: subdomains.length > 0 ? "safe" : "unknown",
    };
  } catch {
    return null;
  }
}
