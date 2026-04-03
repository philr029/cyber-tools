import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { MOCK_WHOIS, createDefaultWHOIS } from "@/lib/mockExtras";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "";

  const validation = validateDomain(domain);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const normalised = domain.trim().toLowerCase();

  // No live WHOIS provider configured by default (RDAP is free but rate-limited).
  // Attempt RDAP lookup using the IANA bootstrap service.
  try {
    const rdapRes = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(normalised)}`,
      { next: { revalidate: 0 }, signal: AbortSignal.timeout(6000) },
    );

    if (rdapRes.ok) {
      const rdap = await rdapRes.json();

      // Parse RDAP response into WHOISResult shape
      const events: Array<{ eventAction: string; eventDate: string }> = rdap.events ?? [];
      const getDate = (action: string) =>
        events.find((e) => e.eventAction === action)?.eventDate?.split("T")[0] ?? "Unknown";

      const nameservers: string[] = (rdap.nameservers ?? []).map(
        (ns: { ldhName: string }) => ns.ldhName?.toLowerCase() ?? "",
      );

      const statusArr: string[] = rdap.status ?? [];

      // Extract registrar from entities
      const entities: Array<{
        roles: string[];
        vcardArray?: unknown[];
        publicIds?: Array<{ type: string; identifier: string }>;
        links?: Array<{ value: string; rel: string; href: string }>;
      }> = rdap.entities ?? [];
      const registrarEntity = entities.find((e) => e.roles?.includes("registrar"));
      const registrarLink = registrarEntity?.links?.find((l) => l.rel === "self")?.href ?? null;
      const registrar = registrarEntity
        ? (registrarEntity.publicIds?.find((p) => p.type === "IANA Registrar ID")?.identifier ?? rdap.name ?? "Unknown")
        : "Unknown";

      return Response.json({
        data: {
          domain: normalised,
          registrar,
          registrarUrl: registrarLink,
          registrantOrg: null,
          registrantCountry: rdap.country ?? null,
          createdDate: getDate("registration"),
          updatedDate: getDate("last changed"),
          expiryDate: getDate("expiration"),
          nameservers,
          status: statusArr,
          dnssec: rdap.secureDNS?.delegationSigned ?? false,
          lookupStatus: "safe" as const,
        },
        mock: false,
      });
    }
  } catch {
    // RDAP failed — use mock
  }

  // Mock fallback
  const data = MOCK_WHOIS[normalised] ?? createDefaultWHOIS(normalised);
  return Response.json({ data, mock: true });
}
