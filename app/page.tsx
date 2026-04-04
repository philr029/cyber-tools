"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { LookupResult, HistoryEntry } from "@/lib/types";
import { lookupAll } from "@/lib/lookup-client";
import { saveToHistory, loadHistory, clearHistory } from "@/lib/mockData";

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

// ---------------------------------------------------------------------------
// Tool cards
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    href: "/tools/ip-lookup",
    title: "IP Reputation",
    description: "Abuse score, ISP, country, and report history.",
    badge: "AbuseIPDB",
    color: "text-blue-600 bg-blue-50",
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
    color: "text-purple-600 bg-purple-50",
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
    color: "text-teal-600 bg-teal-50",
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
    color: "text-emerald-600 bg-emerald-50",
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
    color: "text-orange-600 bg-orange-50",
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
    color: "text-red-600 bg-red-50",
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
    color: "text-indigo-600 bg-indigo-50",
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
    color: "text-pink-600 bg-pink-50",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
        <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
      </svg>
    ),
  },
];

function ToolCards() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${tool.color}`}>
              {tool.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                {tool.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{tool.description}</p>
            </div>
            <span className="mt-auto text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full self-start">
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
    { query: "8.8.8.8", label: "Google DNS", badge: "Safe" },
    { query: "example.com", label: "Example Domain", badge: "Warning" },
    { query: "malicious-test.xyz", label: "Threat Sample", badge: "Risk" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-5">
        <svg
          className="w-8 h-8 text-blue-500"
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
      <h2 className="text-base font-semibold text-gray-900 mb-1.5">Scan an IP or Domain</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-7">
        Enter any IP address or domain above for a comprehensive security analysis.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {examples.map((ex) => (
          <button
            key={ex.query}
            onClick={() => onExample(ex.query)}
            className="flex flex-col items-start gap-1 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left"
          >
            <span className="text-sm font-semibold text-gray-800">{ex.label}</span>
            <span className="text-xs font-mono text-gray-400">{ex.query}</span>
            <span
              className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                ex.badge === "Safe"
                  ? "bg-emerald-50 text-emerald-700"
                  : ex.badge === "Warning"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
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
    <div className="space-y-6">
      {/* Query summary bar */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 flex-shrink-0">
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
          <p className="text-base font-semibold text-gray-900 truncate">{result.query}</p>
          <p className="text-xs text-gray-400 mt-0.5">
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

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    try {
      const { result: data, isMock: mock } = await lookupAll(query);
      if (process.env.NODE_ENV === "development") {
        console.log("[dashboard] lookup result:", data, "isMock:", mock);
      }
      setResult(data);
      setIsMock(mock);
      saveToHistory(data);
      setHistory(loadHistory());
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

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero search section */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8">
            <div className="max-w-2xl mx-auto text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Cyber Intelligence Lookup
              </h1>
              <p className="text-sm text-gray-500">
                Instantly analyse any IP address or domain for security threats, reputation, SSL
                health, and more.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} loading={loading} />
            </div>
          </div>
        </section>

        {/* Main content + sidebar */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-600">Scanning target…</p>
                <p className="text-xs text-gray-400 mt-1">
                  Checking reputation, blacklists, DNS records…
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-4">
                  <svg className="w-7 h-7 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Lookup failed</p>
                <p className="text-sm text-red-600 max-w-sm">{error}</p>
              </div>
            ) : result ? (
              <ResultsGrid result={result} isMock={isMock} />
            ) : (
              <EmptyState onExample={handleSearch} />
            )}
          </div>

          {/* Sidebar: history + tool cards */}
          <aside className="xl:w-80 flex-shrink-0 space-y-5" aria-label="Sidebar">
            {/* History */}
            <div id="history" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                  <h2 className="text-sm font-semibold text-gray-800">Recent Lookups</h2>
                  {history.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gray-400 rounded-full">
                      {history.length}
                    </span>
                  )}
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleHistoryClear}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Clear history"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="px-1 py-2 max-h-72 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <svg
                      className="w-8 h-8 text-gray-200 mb-2"
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
                    <p className="text-xs text-gray-400">No lookups yet</p>
                    <p className="text-xs text-gray-300 mt-0.5">Searches will appear here</p>
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
    </main>
  );
}

