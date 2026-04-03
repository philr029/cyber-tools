import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { fetchSSL } from "@/lib/providers/sslcheck";
import { MOCK_RESULTS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "";

  const validation = validateDomain(domain);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const normalised = domain.trim().toLowerCase();

  const live = await fetchSSL(normalised);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  const mockResult = MOCK_RESULTS[normalised];
  const data = mockResult?.ssl ?? {
    domain: normalised,
    issuer: "Unknown",
    validFrom: "Unknown",
    validTo: "Unknown",
    daysRemaining: 0,
    protocol: "Unknown",
    keySize: 0,
    signatureAlgorithm: "Unknown",
    subjectAltNames: [],
    status: "unknown" as const,
  };

  return Response.json({ data, mock: true });
}
