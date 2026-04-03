"use client";

import { useState, useEffect } from "react";
import type { LookupResult, HistoryEntry } from "@/lib/types";
import { lookupQuery, saveToHistory, loadHistory, clearHistory } from "@/lib/mockData";

import SearchBar from "@/app/components/SearchBar";
import HistoryRow from "@/app/components/HistoryRow";
import IPReputationCard from "@/app/components/results/IPReputationCard";
import DomainReputationCard from "@/app/components/results/DomainReputationCard";
import BlacklistCard from "@/app/components/results/BlacklistCard";
import SSLCard from "@/app/components/results/SSLCard";
import SecurityHeadersCard from "@/app/components/results/SecurityHeadersCard";
import OpenPortsCard from "@/app/components/results/OpenPortsCard";
import DNSCard from "@/app/components/results/DNSCard";

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
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Icon */}
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 mb-6">
        <svg
          className="w-10 h-10 text-blue-500"
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
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Scan an IP or Domain
      </h2>
      <p className="text-sm text-gray-500 max-w-md mb-8">
        Enter an IP address or domain name above to run a comprehensive security analysis including
        reputation checks, blacklist status, SSL certificates, and more.
      </p>

      {/* Example cards */}
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
function ResultsGrid({ result }: { result: LookupResult }) {
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
        <div className="ml-auto flex-shrink-0 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
          Mock Data
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function handleSearch(query: string) {
    setLoading(true);
    try {
      const data = await lookupQuery(query);
      setResult(data);
      saveToHistory(data);
      setHistory(loadHistory());
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
            ) : result ? (
              <ResultsGrid result={result} />
            ) : (
              <EmptyState onExample={handleSearch} />
            )}
          </div>

          {/* History sidebar */}
          <aside id="history" className="xl:w-80 flex-shrink-0" aria-label="Lookup history">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
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

              <div className="px-1 py-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
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
          </aside>
        </div>
      </div>
    </main>
  );
}

