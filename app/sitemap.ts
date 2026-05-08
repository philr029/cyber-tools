import type { MetadataRoute } from "next";

const BASE_URL = "https://philr029.github.io/cyber-tools";

const ROUTES = [
  "/",
  "/about",
  "/pricing",
  "/settings",
  "/tools",
  "/tools/ip-lookup",
  "/tools/domain-lookup",
  "/tools/dns-lookup",
  "/tools/whois",
  "/tools/url-analysis",
  "/tools/ssl-checker",
  "/tools/security-headers",
  "/tools/blacklist",
  "/tools/threat-score",
  "/tools/redirect-trace",
  "/tools/agent-scan",
  "/tools/port-scanner",
  "/tools/subdomains",
  "/tools/email-headers",
  "/tools/phone-lookup",
  "/tools/api-tester",
  "/tools/form-tester",
  "/tools/keyforge",
  "/tools/lead-intelligence",
  "/tools/domain-protection",
  "/tools/ai-report",
  "/tools/geo-lookup",
  "/tools/ai-assistant",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/tools" ? 0.9 : 0.7,
  }));
}
