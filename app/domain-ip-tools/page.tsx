import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Domain & IP Tools — SecureScope Toolkit",
  description: "WHOIS, DNS, geolocation, subdomain enumeration, redirect tracing, blacklist and reputation lookups.",
};

export default function DomainIpToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Domain & IP"
      title="Domain & IP Investigations"
      intro="A focused set of network-layer tools — WHOIS, DNS, geo, subdomains, redirect tracing, and reputation — useful for incident response, brand monitoring, and infrastructure debugging."
      tools={[
        {
          href: "/tools/whois",
          title: "WHOIS / RDAP",
          description: "Registrar, registration dates, status flags, and contact data from IANA RDAP.",
          badge: "Live",
          why: "Step one in every domain investigation.",
          skill: "RDAP / WHOIS data models.",
        },
        {
          href: "/tools/dns-lookup",
          title: "DNS Lookup",
          description: "A, AAAA, MX, TXT, NS records with clean formatting and TTL info.",
          badge: "Live",
          why: "Foundation of mail delivery and infra debugging.",
          skill: "DNS internals.",
        },
        {
          href: "/tools/subdomains",
          title: "Subdomain Finder",
          description: "Enumerate known subdomains via SecurityTrails-style passive DNS data.",
          badge: "Recon",
          why: "Surface unknown attack surface before an attacker does.",
          skill: "Passive DNS, asset inventory.",
        },
        {
          href: "/tools/redirect-trace",
          title: "Redirect Tracer",
          description: "Walk every hop in a redirect chain — useful for debugging short links and tracking pixels.",
          badge: "Live",
          why: "Catches unintended redirect loops and hidden affiliate tags.",
          skill: "HTTP redirect mechanics.",
        },
        {
          href: "/tools/geo-lookup",
          title: "IP Geolocation",
          description: "Country, ASN, organization, and rough location for any IP address.",
          badge: "Live",
          why: "Drives geo-aware alerting and fraud heuristics.",
          skill: "IP geolocation data.",
        },
        {
          href: "/tools/ip-lookup",
          title: "IP Reputation",
          description: "Abuse score, report history and ISP context from AbuseIPDB.",
          badge: "AbuseIPDB",
          why: "Triage suspicious IPs in seconds.",
          skill: "Threat intel API integration.",
        },
        {
          href: "/tools/domain-lookup",
          title: "Domain Reputation",
          description: "VirusTotal multi-engine reputation for any domain.",
          badge: "VirusTotal",
          why: "Verify before whitelisting or following a link.",
          skill: "Reputation aggregation.",
        },
        {
          href: "/tools/blacklist",
          title: "Blacklist Check",
          description: "Check an IP or domain against 70+ DNS-based blacklists.",
          badge: "MxToolbox",
          why: "Mail deliverability and reputation diagnosis.",
          skill: "Blacklist data.",
        },
        {
          href: "/tools/ssl-checker",
          title: "SSL Certificate Inspector",
          description: "Certificate chain, expiry, protocol and key size via SSL Labs.",
          badge: "Live",
          why: "Avoid the worst customer experience: browser cert warnings.",
          skill: "TLS, certificate chains.",
        },
        {
          href: "/tools/domain-protection",
          title: "Domain Protection",
          description: "Combined view of WHOIS, DNS, SSL and reputation for portfolio domain monitoring.",
          badge: "Live",
          why: "One pane of glass for every domain you own.",
          skill: "Multi-source data fusion.",
        },
        {
          href: "/tools/port-scanner",
          title: "Port Scan (informational)",
          description: "Safe-mode reachability check on common ports — informational only.",
          badge: "Info-only",
          why: "Confirms accidental external exposure.",
          skill: "Network recon hygiene.",
        },
      ]}
    />
  );
}
