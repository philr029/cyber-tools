/**
 * Shodan provider adapter.
 * Docs: https://developer.shodan.io/api
 * Env:  SHODAN_API_KEY
 *
 * Returns open ports for an IP address.
 */

import type { OpenPortsResult, PortEntry } from "@/lib/types";

interface ShodanHostResponse {
  ip_str: string;
  ports: number[];
  data?: Array<{
    port: number;
    transport: string;
    product?: string;
    version?: string;
  }>;
}

export async function fetchOpenPorts(ip: string): Promise<OpenPortsResult | null> {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.shodan.io/shodan/host/${encodeURIComponent(ip)}?key=${encodeURIComponent(apiKey)}`,
      { next: { revalidate: 0 } },
    );

    if (!res.ok) return null;
    const json: ShodanHostResponse = await res.json();

    const ports: PortEntry[] = (json.data ?? []).map((d) => ({
      port: d.port,
      protocol: (d.transport ?? "tcp").toUpperCase(),
      service: d.product ?? "Unknown",
      state: "open" as const,
      version: d.version ?? "",
    }));

    // If detailed data is missing, fall back to port list only
    if (ports.length === 0 && json.ports) {
      json.ports.forEach((p) => {
        ports.push({ port: p, protocol: "TCP", service: "Unknown", state: "open", version: "" });
      });
    }

    const openCount = ports.filter((p) => p.state === "open").length;

    return {
      target: ip,
      openCount,
      ports,
      scanDuration: 0, // Shodan uses pre-indexed data
      status: openCount >= 10 ? "risk" : openCount >= 5 ? "warning" : "safe",
    };
  } catch {
    return null;
  }
}
