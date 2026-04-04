import type { NextRequest } from "next/server";
import { validateURL, normaliseURL } from "@/lib/validators";
import { fetchURLAnalysis } from "@/lib/providers/virustotal";
import type { VTURLResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawUrl = body?.url ?? "";

  const validation = validateURL(rawUrl);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const url = normaliseURL(rawUrl.trim());
  const analysis = await fetchURLAnalysis(url);

  if (!analysis) {
    return Response.json(
      { error: "VirusTotal API key not configured or the request failed." },
      { status: 503 },
    );
  }

  const result: VTURLResult = {
    url: analysis.url,
    harmless: analysis.harmless,
    malicious: analysis.malicious,
    suspicious: analysis.suspicious,
    undetected: analysis.undetected,
    status: analysis.status,
  };

  return Response.json(result);
}
