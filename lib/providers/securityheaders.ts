/**
 * Security headers checker.
 * Fetches a URL server-side and inspects HTTP response headers.
 * No API key required.
 */

import type { SecurityHeadersResult, SecurityHeader } from "@/lib/types";

const HEADERS_TO_CHECK: Array<{ name: string; description: string; weight: number }> = [
  {
    name: "Strict-Transport-Security",
    description: "Forces HTTPS connections and prevents protocol downgrade attacks.",
    weight: 20,
  },
  {
    name: "Content-Security-Policy",
    description: "Prevents cross-site scripting (XSS) and injection attacks.",
    weight: 25,
  },
  {
    name: "X-Frame-Options",
    description: "Prevents clickjacking by controlling iframe embedding.",
    weight: 15,
  },
  {
    name: "X-Content-Type-Options",
    description: "Prevents MIME type sniffing attacks.",
    weight: 10,
  },
  {
    name: "Referrer-Policy",
    description: "Controls how much referrer information is included with requests.",
    weight: 10,
  },
  {
    name: "Permissions-Policy",
    description: "Controls access to browser features like camera, microphone, and geolocation.",
    weight: 10,
  },
  {
    name: "Cross-Origin-Opener-Policy",
    description: "Prevents cross-origin documents from sharing browsing context.",
    weight: 5,
  },
  {
    name: "Cross-Origin-Resource-Policy",
    description: "Controls which origins can embed this resource.",
    weight: 5,
  },
];

function scoreToGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "F";
}

export async function fetchSecurityHeaders(domain: string): Promise<SecurityHeadersResult | null> {
  try {
    const url = domain.startsWith("http") ? domain : `https://${domain}`;
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      // Short timeout via AbortController
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 0 },
    });

    const headers: SecurityHeader[] = HEADERS_TO_CHECK.map((h) => ({
      name: h.name,
      present: res.headers.has(h.name.toLowerCase()),
      value: res.headers.get(h.name.toLowerCase()),
      description: h.description,
    }));

    const maxPossibleScore = HEADERS_TO_CHECK.reduce((sum, h) => sum + h.weight, 0);
    const earnedScore = HEADERS_TO_CHECK.reduce((sum, h) => {
      const found = headers.find((hdr) => hdr.name === h.name);
      return sum + (found?.present ? h.weight : 0);
    }, 0);

    const score = Math.round((earnedScore / maxPossibleScore) * 100);
    const grade = scoreToGrade(score);

    const presentCount = headers.filter((h) => h.present).length;
    void presentCount; // used implicitly via earnedScore calculation above
    const status =
      score >= 75 ? "safe" : score >= 40 ? "warning" : "risk";

    return {
      domain,
      score,
      grade,
      headers,
      status,
    };
  } catch {
    return null;
  }
}
