import type { NextRequest } from "next/server";
import { validateURL, normaliseURL } from "@/lib/validators";
import { fetchURLAnalysis } from "@/lib/providers/virustotal";
import { MOCK_URL_ANALYSIS, createDefaultURLAnalysis } from "@/lib/mockExtras";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url") ?? "";

  const validation = validateURL(rawUrl);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const url = normaliseURL(rawUrl.trim());

  const live = await fetchURLAnalysis(url);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  // Try a direct HEAD fetch to get at least status code and content type
  try {
    await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 0 },
    });
  } catch {
    // ignore
  }

  const data = MOCK_URL_ANALYSIS[url] ?? createDefaultURLAnalysis(url);
  return Response.json({ data, mock: true });
}
