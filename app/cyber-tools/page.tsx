import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Cyber Tools — SecureScope Toolkit",
  description: "IP reputation, domain reputation, security headers, SSL, DNS, and phishing inspection tools.",
};

export default function CyberToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Cyber tools"
      title="Cyber & Security Tools"
      intro="Reputation lookups, transport hardening checks, and lightweight phishing triage — designed to plug straight into VirusTotal, AbuseIPDB, and Microsoft 365 security data."
      tools={[
        {
          href: "/tools/ip-lookup",
          title: "IP Reputation",
          description: "Check an IP for abuse reports, ISP, country, and usage type.",
          badge: "AbuseIPDB",
          why: "Front-line triage when an IP turns up in logs or firewall alerts.",
          skill: "Threat intelligence API integration.",
        },
        {
          href: "/tools/domain-lookup",
          title: "Domain Reputation",
          description: "Multi-engine domain reputation from VirusTotal — malicious, suspicious, undetected and harmless counts.",
          badge: "VirusTotal",
          why: "Confirms a domain isn't already flagged before you click or allow-list it.",
          skill: "Multi-engine reputation aggregation.",
        },
        {
          href: "/tools/email-security-checklist",
          title: "Email Security Checklist",
          description: "SPF / DKIM / DMARC / MTA-STS / Defender for Office 365 hardening checklist.",
          badge: "Checklist",
          why: "Closes the easy wins on every BEC and phishing audit.",
          skill: "Email auth, DNS, M365 mail flow.",
        },
        {
          href: "/tools/phishing-url-checklist",
          title: "Phishing URL Heuristics",
          description: "Paste a suspicious URL — get an instant heuristics-based risk score and explanation.",
          badge: "Demo",
          why: "Sanity check before submitting to your real phishing triage queue.",
          skill: "URL parsing, IDN / homoglyph detection.",
        },
        {
          href: "/tools/suspicious-url",
          title: "Suspicious URL Checker",
          description: "URL-syntax phishing inspector — shorteners, homoglyphs, embedded creds, risky TLDs.",
          badge: "Demo",
          why: "Quick local triage before forwarding to Safe Browsing / VirusTotal.",
          skill: "URL parsing, IDN homoglyph detection.",
        },
        {
          href: "/tools/phishing-email-analyser",
          title: "Phishing Email Analyser",
          description: "Score a suspect email from sender, subject, links and urgency tone.",
          badge: "Demo",
          why: "Front-line triage before submitting to the real phishing queue.",
          skill: "Email security heuristics.",
        },
        {
          href: "/tools/password-strength",
          title: "Password Strength Checker",
          description: "Local-only password scoring with weaknesses and safer guidance. Nothing is sent to a server.",
          badge: "Local",
          why: "Quick coaching tool — confirms a chosen password is strong before saving.",
          skill: "Password entropy, secure UI patterns.",
        },
        {
          href: "/tools/ssl-checklist",
          title: "SSL Certificate Checklist",
          description: "Renewal-window checklist — expiry reminder, issuer, HTTPS posture and validation steps.",
          badge: "Checklist",
          why: "Expired certs cause the worst customer experience — a full browser warning.",
          skill: "TLS lifecycle, ACME automation.",
        },
        {
          href: "/tools/dns-security-checklist",
          title: "DNS Security Checklist",
          description: "SPF / DKIM / DMARC / MX / CAA / DNSSEC hardening checklist for a domain.",
          badge: "Checklist",
          why: "DNS is where mail and reputation conversations start.",
          skill: "DNS, email auth, DNSSEC.",
        },
        {
          href: "/tools/incident-response",
          title: "Incident Response Checklist",
          description: "Generate a contain → investigate → eradicate → recover → lessons-learned playbook by incident type.",
          badge: "Generator",
          why: "Repeatable structure prevents forgetting basics like preserving evidence.",
          skill: "Incident response (NIST 800-61).",
        },
        {
          href: "/tools/security-headers",
          title: "Security Headers Checker",
          description: "Inspect HTTP security headers (CSP, HSTS, X-Frame, Referrer-Policy) for any URL.",
          badge: "Live",
          why: "Headers are the cheapest controls available to web teams — easy to miss.",
          skill: "Server-side HEAD requests, header analysis.",
        },
        {
          href: "/tools/ssl-checker",
          title: "SSL Certificate Checker",
          description: "Inspect certificate validity, chain, protocols and key strength via SSL Labs.",
          badge: "Live",
          why: "Catches expired or weak certs before users hit a browser warning.",
          skill: "TLS, certificate chains, SSL Labs API.",
        },
        {
          href: "/tools/dns-lookup",
          title: "DNS Record Lookup",
          description: "Walk through A, AAAA, MX, TXT and NS records for any domain.",
          badge: "Live",
          why: "Foundation of every infrastructure or email investigation.",
          skill: "DNS internals, record types.",
        },
        {
          href: "/tools/port-scanner",
          title: "Port Scan (informational)",
          description: "Safe-mode reachability check for common service ports — informational only.",
          badge: "Info-only",
          why: "Surface obvious exposure without active scanning.",
          skill: "Network reconnaissance hygiene, authorization checks.",
        },
        {
          href: "/tools/threat-score",
          title: "Unified Threat Score",
          description: "Combined IP signal (AbuseIPDB + VirusTotal) with a single verdict.",
          badge: "Aggregator",
          why: "One number for triage and decision-making.",
          skill: "Multi-source threat fusion.",
        },
        {
          href: "/tools/blacklist",
          title: "Blacklist Check",
          description: "Check an IP or domain across 70+ public DNS-based blacklists.",
          badge: "MxToolbox",
          why: "Diagnose mail delivery and reputation problems quickly.",
          skill: "Blacklist data, mail troubleshooting.",
        },
        {
          href: "/tools/whois",
          title: "WHOIS / RDAP",
          description: "Registrar, creation date, and ownership data from IANA RDAP.",
          badge: "Live",
          why: "First step in domain takeover and brand-monitoring work.",
          skill: "WHOIS / RDAP data models.",
        },
        {
          href: "/tools/url-analysis",
          title: "VirusTotal URL Analysis",
          description: "Submit a URL to VirusTotal and surface engine verdicts.",
          badge: "VirusTotal",
          why: "Authoritative second opinion on suspicious links.",
          skill: "Threat intel integration.",
        },
      ]}
    />
  );
}
