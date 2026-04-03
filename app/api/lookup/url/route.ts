import type { NextRequest } from "next/server";
import { validateURL, normaliseURL } from "@/lib/validators";
import { fetchURLAnalysis } from "@/lib/providers/virustotal";
import { MOCK_URL_ANALYSIS, createDefaultURLAnalysis } from "@/lib/mockExtras";
import { assertSafeURL } from "@/lib/ssrf";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url") ?? "";

  const validation = validateURL(rawUrl);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const url = normaliseURL(rawUrl.trim());

  // Guard against SSRF before making any server-side request
  const safeCheck = assertSafeURL(url);
  if (!safeCheck.ok) {
    return Response.json({ error: safeCheck.reason }, { status: 400 });
  }

  const live = await fetchURLAnalysis(url);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  const data = MOCK_URL_ANALYSIS[url] ?? createDefaultURLAnalysis(url);
  return Response.json({ data, mock: true });
}

