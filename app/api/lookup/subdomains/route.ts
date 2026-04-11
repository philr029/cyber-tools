import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { fetchSubdomains } from "@/lib/providers/crtsh";
import type { SubdomainResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("domain") ?? "";
  const domain = raw.trim().toLowerCase();

  const validation = validateDomain(domain);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const live = await fetchSubdomains(domain);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  const fallback: SubdomainResult = {
    domain,
    subdomains: [],
    totalFound: 0,
    source: "crt.sh (Certificate Transparency)",
    status: "unknown",
  };

  return Response.json({ data: fallback, mock: true });
}
