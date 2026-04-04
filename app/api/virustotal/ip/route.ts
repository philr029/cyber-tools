import type { NextRequest } from "next/server";
import { validateIP } from "@/lib/validators";
import { fetchVTIPReputation } from "@/lib/providers/virustotal";

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip") ?? "";

  const validation = validateIP(ip);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const result = await fetchVTIPReputation(ip.trim());

  if (!result) {
    return Response.json(
      { error: "VirusTotal API key not configured or the request failed." },
      { status: 503 },
    );
  }

  return Response.json(result);
}
