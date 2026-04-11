"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { LookupResult, HistoryEntry } from "@/lib/types";
import { lookupAll } from "@/lib/lookup-client";
import { saveToHistory, loadHistory, clearHistory, saveScan } from "@/lib/mockData";
import { SmartInsightsPanel } from "@/app/components/SmartInsightsPanel";
import { useToast } from "@/lib/toast-context";

import SearchBar from "@/app/components/SearchBar";
import HistoryRow from "@/app/components/HistoryRow";
import IPReputationCard from "@/app/components/results/IPReputationCard";
import DomainReputationCard from "@/app/components/results/DomainReputationCard";
import BlacklistCard from "@/app/components/results/BlacklistCard";
import SSLCard from "@/app/components/results/SSLCard";
import SecurityHeadersCard from "@/app/components/results/SecurityHeadersCard";
import OpenPortsCard from "@/app/components/results/OpenPortsCard";
import DNSCard from "@/app/components/results/DNSCard";
import MockDataBanner from "@/app/components/ui/MockDataBanner";
import VirusTotalIPCheck from "@/app/components/VirusTotalIPCheck";
import VirusTotalDomainCheck from "@/app/components/VirusTotalDomainCheck";
import VirusTotalURLCheck from "@/app/components/VirusTotalURLCheck";
import ThreatIPCheck from "@/app/components/ThreatIPCheck";

// ---------------------------------------------------------------------------
// Tool cards
// ---------------------------------------------------------------------------
const TOOLS = [
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
    badge: "HetrixTools",
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
];

function ToolCards() {
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

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ onExample }: { onExample: (q: string) => void }) {
  const examples = [
    { query: "8.8.8.8", label: "Google DNS", badge: "Safe", badgeClass: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
    { query: "google.com", label: "Google.com", badge: "Safe", badgeClass: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
    { query: "cloudflare.com", label: "Cloudflare", badge: "Safe", badgeClass: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-5 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <svg
          className="w-8 h-8 text-cyan-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-slate-200 mb-1.5">Start a Lookup</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-7">
        Enter any IP address, domain, or URL above for a comprehensive security analysis.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {examples.map((ex) => (
          <button
            key={ex.query}
            onClick={() => onExample(ex.query)}
            className="flex flex-col items-start gap-1 p-4 bg-[#0f1629] rounded-xl border border-[#1e2d4a] card-lift text-left group"
          >
            <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">{ex.label}</span>
            <span className="text-xs font-mono text-slate-500">{ex.query}</span>
            <span className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${ex.badgeClass}`}>
              {ex.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Results grid
// ---------------------------------------------------------------------------
function ResultsGrid({ result, isMock }: { result: LookupResult; isMock: boolean }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Query summary bar */}
      <div className="flex items-center gap-3 px-5 py-4 bg-[#0f1629] rounded-2xl border border-[#1e2d4a] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-100 truncate">{result.query}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Scanned{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(result.timestamp))}
          </p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <MockDataBanner isMock={isMock} />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <IPReputationCard data={result.ipReputation} />
        <DomainReputationCard data={result.domainReputation} />
        <BlacklistCard data={result.blacklist} />
        <SSLCard data={result.ssl} />
        <SecurityHeadersCard data={result.securityHeaders} />
        <OpenPortsCard data={result.openPorts} />
        <div className="lg:col-span-2">
          <DNSCard data={result.dns} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [isMock, setIsMock] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [vtTab, setVtTab] = useState<"ip" | "domain" | "url">("ip");
  const [saveLabel, setSaveLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    try {
      const { result: data, isMock: mock } = await lookupAll(query);
      console.log("[dashboard] lookup result:", data, "isMock:", mock);
      setResult(data);
      setIsMock(mock);
      saveToHistory(data);
      setHistory(loadHistory());
      // Scroll to results smoothly
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("[dashboard] lookup error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleHistoryClear() {
    clearHistory();
    setHistory([]);
  }

  function handleSaveScan() {
    if (!result) return;
    const label = saveLabel.trim() || result.query;
    setSaving(true);
    try {
      saveScan(result, label);
      toast(`Scan saved as "${label}"`, "success");
      setSaveLabel("");
    } catch {
      toast("Failed to save scan.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative hero-gradient grid-bg overflow-hidden">
        {/* Radial glow behind headline */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-xs font-medium text-cyan-400 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Cyber Intelligence Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-50 leading-tight tracking-tight mb-5 animate-fade-in-delay text-glow">
            Cyber Intelligence
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Platform
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-delay">
            Analyse IPs, domains, and URLs with real-time reputation, DNS, SSL, headers,
            blacklist, and WHOIS data — all in one place.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 animate-fade-in-delay-2">
            <button
              type="button"
              onClick={() => {
                document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 hover:from-cyan-400 hover:to-blue-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              Start Lookup
            </button>
            <button
              type="button"
              onClick={() => handleSearch("google.com")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1e2d4a] bg-white/5 text-slate-300 font-semibold text-sm hover:bg-white/10 hover:border-slate-600 hover:text-slate-100 transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
              </svg>
              View Demo
            </button>
          </div>

          {/* Search bar */}
          <div id="search-section" className="max-w-2xl mx-auto animate-fade-in-delay-2">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────── */}
      <section className="border-y border-[#1e2d4a] bg-[#0b0f1a]/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <p className="text-xs text-slate-500 max-w-md">
              Built with secure server-side APIs, SSRF protection, and modern threat intelligence providers.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              {[
                { label: "Next.js", color: "text-slate-300 bg-slate-700/40 ring-slate-600/30" },
                { label: "TypeScript", color: "text-blue-400 bg-blue-500/10 ring-blue-500/20" },
                { label: "Secure API Routes", color: "text-cyan-400 bg-cyan-500/10 ring-cyan-500/20" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${badge.color}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VirusTotal Threat Checks section */}
        <section className="mb-8">
          <div className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] px-6 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-200 mb-1">VirusTotal Threat Checks</h2>
              <p className="text-sm text-slate-500">
                Check IPs, domains, and URLs directly against VirusTotal&apos;s threat intelligence database.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5" role="tablist" aria-label="VirusTotal check type">
              {(["ip", "domain", "url"] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={vtTab === tab}
                  onClick={() => setVtTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    vtTab === tab
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      : "bg-slate-700/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 ring-1 ring-[#1e2d4a]"
                  }`}
                >
                  {tab === "ip" ? "IP" : tab === "domain" ? "Domain" : "URL"}
                </button>
              ))}
            </div>

            <div role="tabpanel">
              {vtTab === "ip" && <VirusTotalIPCheck />}
              {vtTab === "domain" && <VirusTotalDomainCheck />}
              {vtTab === "url" && <VirusTotalURLCheck />}
            </div>
          </div>
        </section>

        {/* Unified Threat Intelligence section */}
        <section className="mb-8">
          <div className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] px-6 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-200 mb-1">
                Unified Threat Intelligence
              </h2>
              <p className="text-sm text-slate-500">
                Combined AbuseIPDB + VirusTotal IP analysis with a single threat score and verdict.
              </p>
            </div>
            <ThreatIPCheck />
          </div>
        </section>

        {/* Main content + sidebar */}
        <div ref={resultsRef} className="flex flex-col xl:flex-row gap-6">
          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-cyan-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-t-blue-500/60 animate-spin-reverse" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Scanning target…</p>
                <p className="text-xs text-slate-500 mt-1">
                  Checking reputation, blacklists, DNS records…
                </p>

                {/* Skeleton cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-8 h-8 rounded-lg" />
                        <div className="skeleton h-4 w-32" />
                      </div>
                      <div className="skeleton h-3 w-full" />
                      <div className="skeleton h-3 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                  <svg className="w-7 h-7 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-200 mb-1">Lookup failed</p>
                <p className="text-sm text-red-400 max-w-sm">{error}</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <ResultsGrid result={result} isMock={isMock} />
                <SmartInsightsPanel result={result} />
                {/* Save scan */}
                <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <svg className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  <input
                    type="text"
                    value={saveLabel}
                    onChange={(e) => setSaveLabel(e.target.value)}
                    placeholder={`Label (default: ${result.query})`}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSaveScan}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shrink-0"
                  >
                    Save scan
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState onExample={handleSearch} />
            )}
          </div>

          {/* Sidebar: history + tool cards */}
          <aside className="xl:w-80 flex-shrink-0 space-y-5" aria-label="Sidebar">
            {/* History */}
            <div id="history" className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] overflow-hidden sticky top-20 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#162038]">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-slate-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h2 className="text-sm font-semibold text-slate-300">Recent Lookups</h2>
                  {history.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-slate-900 bg-cyan-400 rounded-full">
                      {history.length}
                    </span>
                  )}
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleHistoryClear}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    aria-label="Clear history"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="px-1 py-2 max-h-72 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                    <svg
                      className="w-8 h-8 text-slate-700 mb-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-slate-500 mb-3">No lookups yet</p>
                    <div className="space-y-1.5 w-full">
                      {[
                        { query: "8.8.8.8", label: "8.8.8.8" },
                        { query: "google.com", label: "google.com" },
                        { query: "cloudflare.com", label: "cloudflare.com" },
                      ].map((ex) => (
                        <button
                          key={ex.query}
                          onClick={() => handleSearch(ex.query)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/20 hover:bg-cyan-500/10 border border-[#1e2d4a] hover:border-cyan-500/20 text-xs text-slate-400 hover:text-cyan-400 transition-all group"
                        >
                          <span className="font-mono">{ex.label}</span>
                          <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  history.map((entry) => (
                    <HistoryRow key={entry.id} entry={entry} onSelect={handleSearch} />
                  ))
                )}
              </div>
            </div>

            {/* Tool cards */}
            <ToolCards />
          </aside>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#1e2d4a] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-slate-400">
                Built by{" "}
                <span className="font-semibold text-slate-200">Philip Ruttley</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/philr029"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="GitHub profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/philipruttley"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="LinkedIn profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
