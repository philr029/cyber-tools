import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { fetchSecurityHeaders } from "@/lib/providers/securityheaders";
import { MOCK_RESULTS } from "@/lib/mockData";
import type { SecurityHeader } from "@/lib/types";

const DEFAULT_HEADERS: SecurityHeader[] = [
  { name: "Strict-Transport-Security", present: false, value: null, description: "Forces HTTPS connections and prevents protocol downgrade attacks." },
  { name: "Content-Security-Policy", present: false, value: null, description: "Prevents cross-site scripting (XSS) and injection attacks." },
  { name: "X-Frame-Options", present: false, value: null, description: "Prevents clickjacking by controlling iframe embedding." },
  { name: "X-Content-Type-Options", present: false, value: null, description: "Prevents MIME type sniffing attacks." },
  { name: "Referrer-Policy", present: false, value: null, description: "Controls how much referrer information is included with requests." },
  { name: "Permissions-Policy", present: false, value: null, description: "Controls access to browser features like camera, microphone, and geolocation." },
  { name: "Cross-Origin-Opener-Policy", present: false, value: null, description: "Prevents cross-origin documents from sharing browsing context." },
  { name: "Cross-Origin-Resource-Policy", present: false, value: null, description: "Controls which origins can embed this resource." },
];

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "";

  const validation = validateDomain(domain);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const normalised = domain.trim().toLowerCase();

  const live = await fetchSecurityHeaders(normalised);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  const mockResult = MOCK_RESULTS[normalised];
  const data = mockResult?.securityHeaders ?? {
    domain: normalised,
    score: 0,
    grade: "F",
    headers: DEFAULT_HEADERS,
    status: "unknown" as const,
  };

  return Response.json({ data, mock: true });
}
