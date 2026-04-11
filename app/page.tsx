"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { LookupResult, HistoryEntry } from "@/lib/types";
import { lookupAll } from "@/lib/lookup-client";
import { saveToHistory, loadHistory, clearHistory, saveScan } from "@/lib/mockData";
import { SmartInsightsPanel } from "@/app/components/SmartInsightsPanel";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import { useDailyScans, FREE_DAILY_LIMIT } from "@/lib/use-daily-scans";

import SearchBar from "@/app/components/SearchBar";
import EmptyState from "@/app/components/EmptyState";
import ResultsGrid from "@/app/components/ResultsGrid";
import HistorySidebar from "@/app/components/HistorySidebar";
import ToolCards from "@/app/components/ToolCards";
import VirusTotalIPCheck from "@/app/components/VirusTotalIPCheck";
import VirusTotalDomainCheck from "@/app/components/VirusTotalDomainCheck";
import VirusTotalURLCheck from "@/app/components/VirusTotalURLCheck";
import ThreatIPCheck from "@/app/components/ThreatIPCheck";
import ScanTimeline from "@/app/components/ScanTimeline";
import QuickToolsBar from "@/app/components/QuickToolsBar";
import ToolPresets from "@/app/components/ToolPresets";

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
        <svg className="w-7 h-7 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-200 mb-1">Lookup failed</p>
      <p className="text-sm text-red-400 max-w-sm">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page footer
// ---------------------------------------------------------------------------
function PageFooter() {
  return (
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
              Built by <span className="font-semibold text-slate-200">Philip Ruttley</span>
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
  const { user } = useAuth();
  const { scansToday, canScan, increment: incrementScan } = useDailyScans(user?.plan ?? null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!canScan) {
      toast(
        `Free tier limit reached (${FREE_DAILY_LIMIT} scans/day). Upgrade to Pro for unlimited scans.`,
        "error",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { result: data, isMock: mock } = await lookupAll(query);
      console.log("[dashboard] lookup result:", data, "isMock:", mock);
      setResult(data);
      setIsMock(mock);
      saveToHistory(data);
      setHistory(loadHistory());
      incrementScan();
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
  }, [canScan, incrementScan, toast]);

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
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-xs font-medium text-cyan-400 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Cyber Intelligence Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-50 leading-tight tracking-tight mb-5 animate-fade-in-delay text-glow">
            Cyber Intelligence
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Platform
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-delay">
            Analyse IPs, domains, and URLs with real-time reputation, DNS, SSL, headers,
            blacklist, and WHOIS data — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 animate-fade-in-delay-2">
            <button
              type="button"
              onClick={() => {
                document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-glow btn-micro inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 hover:from-cyan-400 hover:to-blue-500"
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

          <div id="search-section" className="max-w-2xl mx-auto animate-fade-in-delay-2">
            <SearchBar onSearch={handleSearch} loading={loading} />
            {user && user.plan === "free" && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1321]/80 border border-[#1e2d4a] text-xs">
                  <span className={scansToday >= FREE_DAILY_LIMIT ? "text-red-400" : "text-slate-400"}>
                    {scansToday}/{FREE_DAILY_LIMIT} scans today
                  </span>
                  <span className="w-20 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                    <span
                      className={`block h-full rounded-full transition-all duration-500 ${
                        scansToday >= FREE_DAILY_LIMIT ? "bg-red-500" : "bg-cyan-500"
                      }`}
                      style={{ width: `${Math.min((scansToday / FREE_DAILY_LIMIT) * 100, 100)}%` }}
                    />
                  </span>
                  {scansToday >= FREE_DAILY_LIMIT ? (
                    <Link href="/pricing" className="text-cyan-400 hover:text-cyan-300 underline transition-colors">
                      Upgrade to Pro
                    </Link>
                  ) : (
                    <span className="text-slate-600">{FREE_DAILY_LIMIT - scansToday} remaining</span>
                  )}
                </div>
              </div>
            )}
            {/* Preset buttons below search bar */}
            <div className="mt-5">
              <ToolPresets onSelect={handleSearch} />
            </div>
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
        {/* Quick Tools Bar */}
        <section className="mb-8">
          <QuickToolsBar />
        </section>

        {/* VirusTotal Threat Checks */}
        <section className="mb-8">
          <div className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] px-6 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-200 mb-1">VirusTotal Threat Checks</h2>
              <p className="text-sm text-slate-500">
                Check IPs, domains, and URLs directly against VirusTotal&apos;s threat intelligence database.
              </p>
            </div>

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

        {/* Unified Threat Intelligence */}
        <section className="mb-8">
          <div className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] px-6 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-200 mb-1">Unified Threat Intelligence</h2>
              <p className="text-sm text-slate-500">
                Combined AbuseIPDB + VirusTotal IP analysis with a single threat score and verdict.
              </p>
            </div>
            <ThreatIPCheck />
          </div>
        </section>

        {/* Main content + sidebar */}
        <div ref={resultsRef} className="flex flex-col xl:flex-row gap-6">
          {/* Results area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <ScanTimeline />
            ) : error ? (
              <ErrorState message={error} />
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
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shrink-0 btn-micro"
                  >
                    Save scan
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState onExample={handleSearch} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="xl:w-80 flex-shrink-0 space-y-5" aria-label="Sidebar">
            <HistorySidebar history={history} onSelect={handleSearch} onClear={handleHistoryClear} />
            <ToolCards />
          </aside>
        </div>
      </div>

      <PageFooter />
    </main>
  );
}
