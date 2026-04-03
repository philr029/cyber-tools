/**
 * SecurityTrails provider adapter.
 * Docs: https://docs.securitytrails.com/
 * Env:  SECURITYTRAILS_API_KEY
 */

import type { DNSResult, DNSRecord } from "@/lib/types";

interface STDNSResponse {
  type: string;
  records?: Array<{ value: string; ip?: string; ip6?: string; ttl?: number }>;
  values?: Array<{ value: string; ip?: string; ip6?: string; ttl?: number }>;
}

export async function fetchDNS(domain: string): Promise<DNSResult | null> {
  const apiKey = process.env.SECURITYTRAILS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.securitytrails.com/v1/domain/${encodeURIComponent(domain)}/dns`,
      {
        headers: {
          APIKEY: apiKey,
          Accept: "application/json",
        },
        next: { revalidate: 0 },
      },
    );

    if (!res.ok) return null;
    const json = await res.json();

    const records: DNSRecord[] = [];

    // Parse each record type returned by SecurityTrails
    const recordTypes = ["a", "aaaa", "mx", "ns", "txt", "cname", "soa"] as const;
    for (const type of recordTypes) {
      const section: STDNSResponse | undefined = json[type];
      if (!section) continue;

      const items = section.records ?? section.values ?? [];
      for (const item of items) {
        const value = item.value ?? item.ip ?? item.ip6 ?? "";
        if (value) {
          records.push({
            type: type.toUpperCase(),
            value,
            ttl: item.ttl ?? 300,
          });
        }
      }
    }

    // Extract NS values for display
    const nameservers = records
      .filter((r) => r.type === "NS")
      .map((r) => r.value);

    return {
      domain,
      records,
      nameservers,
      reverseDNS: null,
      status: records.length > 0 ? "safe" : "unknown",
    };
  } catch {
    return null;
  }
}
