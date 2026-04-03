/**
 * WHOIS / registrar lookup via the public IANA RDAP bootstrap service.
 * No API key required. Rate-limited by rdap.org.
 * Docs: https://rdap.org/
 */

import type { WHOISResult } from "@/lib/types";

type RDAPEntity = {
  roles: string[];
  publicIds?: Array<{ type: string; identifier: string }>;
  links?: Array<{ value: string; rel: string; href: string }>;
};

function extractRegistrarName(
  entity: RDAPEntity | undefined,
  rdapName: string | undefined,
): string {
  if (!entity) return "Unknown";
  const ianaId = entity.publicIds?.find((p) => p.type === "IANA Registrar ID")?.identifier;
  if (ianaId) return ianaId;
  if (rdapName) return rdapName;
  return "Unknown";
}

export async function fetchWHOIS(domain: string): Promise<WHOISResult | null> {
  try {
    const res = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      { next: { revalidate: 0 }, signal: AbortSignal.timeout(6000) },
    );

    if (!res.ok) return null;
    const rdap = await res.json();

    const events: Array<{ eventAction: string; eventDate: string }> = rdap.events ?? [];
    const getDate = (action: string) =>
      events.find((e) => e.eventAction === action)?.eventDate?.split("T")[0] ?? "Unknown";

    const nameservers: string[] = (rdap.nameservers ?? []).map(
      (ns: { ldhName: string }) => ns.ldhName?.toLowerCase() ?? "",
    );

    const entities: Array<{
      roles: string[];
      publicIds?: Array<{ type: string; identifier: string }>;
      links?: Array<{ value: string; rel: string; href: string }>;
    }> = rdap.entities ?? [];

    const registrarEntity = entities.find((e) => e.roles?.includes("registrar"));
    const registrarLink = registrarEntity?.links?.find((l) => l.rel === "self")?.href ?? null;
    const registrar = extractRegistrarName(registrarEntity, rdap.name);

    return {
      domain,
      registrar,
      registrarUrl: registrarLink,
      registrantOrg: null,
      registrantCountry: rdap.country ?? null,
      createdDate: getDate("registration"),
      updatedDate: getDate("last changed"),
      expiryDate: getDate("expiration"),
      nameservers,
      status: rdap.status ?? [],
      dnssec: rdap.secureDNS?.delegationSigned ?? false,
      lookupStatus: "safe",
    };
  } catch {
    return null;
  }
}
