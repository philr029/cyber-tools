import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { fetchVTDomainReputation } from "@/lib/providers/virustotal";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "";

  const validation = validateDomain(domain);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const result = await fetchVTDomainReputation(domain.trim().toLowerCase());

  if (!result) {
    return Response.json(
      { error: "VirusTotal API key not configured or the request failed." },
      { status: 503 },
    );
  }

  return Response.json(result);
}
