import type { NextRequest } from "next/server";
import { validateIPOrDomain } from "@/lib/validators";
import { fetchBlacklist } from "@/lib/providers/hetrixtools";
import { MOCK_RESULTS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("target") ?? "";

  const validation = validateIPOrDomain(target);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const normalised = target.trim().toLowerCase();

  const live = await fetchBlacklist(normalised);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  const mockResult = MOCK_RESULTS[normalised];
  const data = mockResult?.blacklist ?? {
    target: normalised,
    entries: [
      { source: "Spamhaus ZEN", listed: false, detail: "Not listed" },
      { source: "SURBL", listed: false, detail: "Not listed" },
      { source: "Barracuda", listed: false, detail: "Not listed" },
      { source: "SpamCop", listed: false, detail: "Not listed" },
      { source: "UCEPROTECT", listed: false, detail: "Not listed" },
    ],
    listedCount: 0,
    totalChecked: 5,
    status: "unknown" as const,
  };

  return Response.json({ data, mock: true });
}
