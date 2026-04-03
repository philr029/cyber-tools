import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { fetchDomainReputation } from "@/lib/providers/virustotal";
import { MOCK_RESULTS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "";

  const validation = validateDomain(domain);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const live = await fetchDomainReputation(domain.trim().toLowerCase());
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  const normalised = domain.trim().toLowerCase();
  const mockResult = MOCK_RESULTS[normalised];
  const data = mockResult?.domainReputation ?? {
    domain: normalised,
    malicious: 0,
    suspicious: 0,
    undetected: 0,
    harmless: 0,
    categories: [],
    registrar: "Unknown",
    createdDate: "Unknown",
    status: "unknown" as const,
  };

  return Response.json({ data, mock: true });
}
