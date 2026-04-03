import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { fetchWHOIS } from "@/lib/providers/whois";
import { MOCK_WHOIS, createDefaultWHOIS } from "@/lib/mockExtras";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "";

  const validation = validateDomain(domain);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const normalised = domain.trim().toLowerCase();

  const live = await fetchWHOIS(normalised);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  const data = MOCK_WHOIS[normalised] ?? createDefaultWHOIS(normalised);
  return Response.json({ data, mock: true });
}
