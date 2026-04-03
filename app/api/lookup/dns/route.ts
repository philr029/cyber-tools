import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { fetchDNS } from "@/lib/providers/securitytrails";
import { MOCK_RESULTS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "";

  const validation = validateDomain(domain);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const normalised = domain.trim().toLowerCase();

  const live = await fetchDNS(normalised);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  const mockResult = MOCK_RESULTS[normalised];
  const data = mockResult?.dns ?? {
    domain: normalised,
    records: [],
    nameservers: [],
    reverseDNS: null,
    status: "unknown" as const,
  };

  return Response.json({ data, mock: true });
}
