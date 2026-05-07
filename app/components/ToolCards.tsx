import Link from "next/link";
import type { ReactNode } from "react";

interface Tool {
  href: string;
  title: string;
  description: string;
  badge: string;
  iconColor: string;
  bgColor: string;
  icon: ReactNode;
}

export const TOOLS: Tool[] = [
  {
    href: "/tools/ip-lookup",
    title: "IP Reputation",
    description: "Abuse score, ISP, country, and report history.",
    badge: "AbuseIPDB",
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/domain-lookup",
    title: "Domain Reputation",
    description: "Multi-engine vendor analysis and category data.",
    badge: "VirusTotal",
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/dns-lookup",
    title: "DNS Lookup",
    description: "A, AAAA, MX, TXT, NS records and nameservers.",
    badge: "SecurityTrails",
    iconColor: "text-teal-400",
    bgColor: "bg-teal-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
      </svg>
    ),
  },
  {
    href: "/tools/ssl-checker",
    title: "SSL Certificate",
    description: "Expiry, issuer, protocol, and key details.",
    badge: "SSL Labs",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/security-headers",
    title: "Security Headers",
    description: "Graded HTTP header analysis against best practices.",
    badge: "Live Fetch",
    iconColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M3 3.5A1.5 1.5 0 014.5 2h11A1.5 1.5 0 0117 3.5v1A1.5 1.5 0 0115.5 6h-11A1.5 1.5 0 013 4.5v-1zM3 9.5A1.5 1.5 0 014.5 8h11A1.5 1.5 0 0117 9.5v1a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 10.5v-1zM4.5 14a1.5 1.5 0 00-1.5 1.5v1A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5v-1a1.5 1.5 0 00-1.5-1.5h-11z" />
      </svg>
    ),
  },
  {
    href: "/tools/blacklist",
    title: "Blacklist Check",
    description: "Spamhaus, SURBL, Barracuda, SpamCop, and more.",
    badge: "MxToolbox",
    iconColor: "text-red-400",
    bgColor: "bg-red-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/whois",
    title: "WHOIS Lookup",
    description: "Registrar, creation date, expiry, and nameservers.",
    badge: "RDAP",
    iconColor: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/url-analysis",
    title: "URL Analysis",
    description: "Threat detection, redirect chain, and content type.",
    badge: "VirusTotal",
    iconColor: "text-pink-400",
    bgColor: "bg-pink-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
        <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
      </svg>
    ),
  },
  {
    href: "/tools/keyforge",
    title: "KeyForge",
    description: "Generate strong passwords and passphrases client-side.",
    badge: "Client-side",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8 7a5 5 0 114.546 4.978l-.285.286a.75.75 0 01-.531.22H11v.75a.75.75 0 01-.75.75H9.5v.75a.75.75 0 01-.75.75h-2A.75.75 0 016 15v-1.879a.75.75 0 01.22-.53l2.502-2.502A5.003 5.003 0 018 7zm5-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/geo-lookup",
    title: "Geolocation & ASN",
    description: "Country, city, ISP, ASN, timezone, and map preview.",
    badge: "ip-api.com",
    iconColor: "text-green-400",
    bgColor: "bg-green-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/threat-score",
    title: "Threat Score",
    description: "Combined risk score from SSL, WHOIS age, and headers.",
    badge: "Multi-source",
    iconColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/port-scanner",
    title: "Port Scanner",
    description: "Safe-mode TCP scan of 15 common ports.",
    badge: "Safe Scan",
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M2 5a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm6 0a1 1 0 012 0v2h2V5a1 1 0 112 0v2a2 2 0 01-2 2H9a2 2 0 01-2-2V5zm-1 7a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/email-headers",
    title: "Email Headers",
    description: "SPF/DKIM/DMARC analysis and sender IP extraction.",
    badge: "Phishing Detection",
    iconColor: "text-violet-400",
    bgColor: "bg-violet-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
        <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
      </svg>
    ),
  },
  {
    href: "/tools/redirect-trace",
    title: "Redirect Tracer",
    description: "Follow URL redirect chains and flag suspicious hops.",
    badge: "Server-side",
    iconColor: "text-sky-400",
    bgColor: "bg-sky-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" clipRule="evenodd" />
        <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
      </svg>
    ),
  },
  {
    href: "/tools/subdomains",
    title: "Subdomain Finder",
    description: "Enumerate subdomains via certificate transparency logs.",
    badge: "crt.sh",
    iconColor: "text-teal-400",
    bgColor: "bg-teal-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
      </svg>
    ),
  },
  {
    href: "/tools/phone-lookup",
    title: "Phone Validator",
    description: "Format check, country & carrier detection, VoIP / risk flags.",
    badge: "Client-side",
    iconColor: "text-violet-400",
    bgColor: "bg-violet-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/api-tester",
    title: "API Tester",
    description: "Send GET/POST/PUT/DELETE requests and inspect responses.",
    badge: "Server-proxy",
    iconColor: "text-violet-400",
    bgColor: "bg-violet-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    href: "/tools/form-tester",
    title: "Form Tester",
    description: "Submit form data and check for CSRF, validation, and security headers.",
    badge: "Security Check",
    iconColor: "text-pink-400",
    bgColor: "bg-pink-500/10",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
];

export default function ToolCards() {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2.5">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex flex-col gap-2 p-4 bg-[#0f1629] rounded-2xl border border-[#1e2d4a] card-lift group"
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${tool.bgColor} ${tool.iconColor}`}>
              {tool.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors leading-tight">
                {tool.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{tool.description}</p>
            </div>
            <span className="mt-auto text-xs font-medium text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full self-start ring-1 ring-[#1e2d4a]">
              {tool.badge}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
