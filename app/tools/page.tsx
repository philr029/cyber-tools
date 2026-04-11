"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import type {
  DomainReputationResult,
  WHOISResult,
  DNSResult,
  SSLCertificateResult,
  IPReputationResult,
  GeoResult,
  OpenPortsResult,
  EmailHeaderResult,
  PhoneResult,
} from "@/lib/types";
import { detectInputType, INPUT_TYPE_INFO, type InputType } from "@/lib/tools-engine/detector";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import DomainReputationCard from "@/app/components/results/DomainReputationCard";
import WHOISCard from "@/app/components/results/WHOISCard";
import DNSCard from "@/app/components/results/DNSCard";
import SSLCard from "@/app/components/results/SSLCard";
import IPReputationCard from "@/app/components/results/IPReputationCard";
import GeoCard from "@/app/components/results/GeoCard";
import OpenPortsCard from "@/app/components/results/OpenPortsCard";
import EmailHeaderCard from "@/app/components/results/EmailHeaderCard";
import PhoneCard from "@/app/components/results/PhoneCard";

// ---------------------------------------------------------------------------
// Tool catalogue shown at the bottom of the page
// ---------------------------------------------------------------------------

const TOOL_CARDS = [
  {
    href: "/tools/domain-lookup",
    title: "Domain Reputation",
    description: "Multi-engine threat analysis via VirusTotal.",
    icon: (
      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/email-headers",
    title: "Email Header Analyzer",
    description: "SPF, DKIM & DMARC authentication checks.",
    icon: (
      <svg className="w-5 h-5 text-violet-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
        <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
      </svg>
    ),
  },
  {
    href: "/tools/phone-lookup",
    title: "Phone Validator",
    description: "Country, carrier & VoIP / risk flag detection.",
    icon: (
      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/tools/port-scanner",
    title: "Port Scanner",
    description: "Safe TCP connect scan of 15 common ports.",
    icon: (
      <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M2 5a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm6 0a1 1 0 012 0v2h2V5a1 1 0 112 0v2a2 2 0 01-2 2H9a2 2 0 01-2-2V5zm-1 7a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Result shapes
// ---------------------------------------------------------------------------

interface DomainResults {
  domain: DomainReputationResult;
  whois: WHOISResult | null;
  dns: DNSResult | null;
  ssl: SSLCertificateResult | null;
}

interface IPResults {
  ip: IPReputationResult;
  geo: GeoResult | null;
  ports: OpenPortsResult | null;
}

type ScanResults =
  | { type: "domain"; data: DomainResults }
  | { type: "ip"; data: IPResults }
  | { type: "email-headers"; data: EmailHeaderResult }
  | { type: "phone"; data: PhoneResult };

// ---------------------------------------------------------------------------
// Detected-type badge
// ---------------------------------------------------------------------------

function TypeBadge({ inputType }: { inputType: InputType }) {
  const info = INPUT_TYPE_INFO[inputType];
  if (inputType === "unknown") return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${info.bgColor} ${info.color} ${info.ringColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotColor}`} />
      Detected: {info.label} — {info.description}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ToolsPage() {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<InputType>("unknown");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-detect input type as the user types
  useEffect(() => {
    setInputType(detectInputType(input));
  }, [input]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxH = 260;
    ta.style.height = `${Math.min(ta.scrollHeight, maxH)}px`;
    ta.style.overflowY = ta.scrollHeight > maxH ? "auto" : "hidden";
  }, [input]);

  const handleScan = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || inputType === "unknown") return;

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const {
        lookupDomain,
        lookupWHOIS,
        lookupDNS,
        lookupSSL,
        lookupIP,
        lookupGeo,
        lookupPortScan,
        analyseEmailHeaders,
        lookupPhone,
      } = await import("@/lib/lookup-client");

      if (inputType === "domain") {
        const [domainRes, whoisRes, dnsRes, sslRes] = await Promise.allSettled([
          lookupDomain(trimmed),
          lookupWHOIS(trimmed),
          lookupDNS(trimmed),
          lookupSSL(trimmed),
        ]);

        const domain =
          domainRes.status === "fulfilled"
            ? domainRes.value.data
            : ({ domain: trimmed, malicious: 0, suspicious: 0, undetected: 0, harmless: 0, categories: [], registrar: "—", createdDate: "—", status: "unknown" } as DomainReputationResult);

        setResults({
          type: "domain",
          data: {
            domain,
            whois: whoisRes.status === "fulfilled" ? whoisRes.value.data : null,
            dns: dnsRes.status === "fulfilled" ? dnsRes.value.data : null,
            ssl: sslRes.status === "fulfilled" ? sslRes.value.data : null,
          },
        });
        return;
      }

      if (inputType === "ip") {
        const [ipRes, geoRes, portsRes] = await Promise.allSettled([
          lookupIP(trimmed),
          lookupGeo(trimmed),
          lookupPortScan(trimmed),
        ]);

        const ip =
          ipRes.status === "fulfilled"
            ? ipRes.value.data
            : ({ ipAddress: trimmed, abuseConfidenceScore: 0, isp: "—", usageType: "—", country: "—", countryCode: "--", totalReports: 0, lastReportedAt: null, status: "unknown" } as IPReputationResult);

        setResults({
          type: "ip",
          data: {
            ip,
            geo: geoRes.status === "fulfilled" ? geoRes.value.data : null,
            ports: portsRes.status === "fulfilled" ? portsRes.value.data : null,
          },
        });
        return;
      }

      if (inputType === "email-headers") {
        const { data } = await analyseEmailHeaders(trimmed);
        setResults({ type: "email-headers", data });
        return;
      }

      if (inputType === "phone") {
        const { data } = await lookupPhone(trimmed);
        setResults({ type: "phone", data });
        return;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, inputType]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ctrl/Cmd + Enter submits the form
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void handleScan();
    }
  }

  const canSubmit = !loading && input.trim().length > 0 && inputType !== "unknown";

  const isEmailHeadersInput = inputType === "email-headers" || input.includes("\n");

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20">
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </span>
            <h1 className="text-xl font-bold text-slate-100">Core Tools Engine</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-lg">
            Paste a domain, IP address, phone number, or raw email headers — the engine detects the
            input type automatically and runs the right analysis.
          </p>
        </div>

        {/* Unified scan form */}
        <div className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] shadow-[0_4px_24px_rgba(0,0,0,0.3)] p-5 mb-6">
          <div className="space-y-3">
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setResults(null);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  isEmailHeadersInput
                    ? "Paste raw email headers here…"
                    : "Enter a domain (e.g. example.com), IP (e.g. 8.8.8.8), phone (+1 202 555 0199) or paste email headers…"
                }
                rows={isEmailHeadersInput ? 8 : 1}
                disabled={loading}
                className={`w-full px-4 py-3.5 bg-[#0b0f1a] border rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition disabled:opacity-50 resize-none leading-relaxed ${
                  inputType !== "unknown" && input.trim()
                    ? "border-cyan-500/30 text-slate-200"
                    : "border-[#1e2d4a] text-slate-200"
                } ${isEmailHeadersInput ? "font-mono text-xs" : ""}`}
                aria-label="Scan input"
              />
              {/* Clear button */}
              {input.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={() => { setInput(""); setResults(null); setError(null); }}
                  className="absolute top-3 right-3 text-slate-600 hover:text-slate-400 transition-colors"
                  aria-label="Clear input"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Type badge + submit row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                {input.trim() ? (
                  <TypeBadge inputType={inputType} />
                ) : (
                  <p className="text-xs text-slate-600">
                    Try:{" "}
                    {["example.com", "8.8.8.8", "+1 202 555 0199"].map((ex, i) => (
                      <span key={ex}>
                        {i > 0 && " · "}
                        <button
                          type="button"
                          onClick={() => setInput(ex)}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                        >
                          {ex}
                        </button>
                      </span>
                    ))}
                  </p>
                )}
                {input.trim() && inputType === "unknown" && (
                  <p className="text-xs text-amber-400/80">
                    ⚠ Input not recognised — enter a valid domain, IP, phone number, or paste email headers.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleScan()}
                disabled={!canSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0f1629] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scanning…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Scan
                  </>
                )}
              </button>
            </div>

            {isEmailHeadersInput && !loading && (
              <p className="text-[11px] text-slate-600">
                Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Ctrl</kbd>
                {" "}+{" "}
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Enter</kbd>{" "}
                to submit
              </p>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <LoadingSpinner
            label={`Running ${INPUT_TYPE_INFO[inputType]?.label ?? "scan"}…`}
            sublabel="Querying threat intelligence sources — please wait."
          />
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results && <ScanResultsPanel results={results} />}

        {/* Tool cards grid */}
        {!loading && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Individual Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOOL_CARDS.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-[#0d1321] border border-[#1e2d4a] hover:border-cyan-500/30 hover:bg-[#0f1629] transition-all"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#131929] border border-[#1e2d4a] group-hover:border-cyan-500/20 shrink-0 transition-colors">
                    {card.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{card.description}</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-600 group-hover:text-cyan-500/60 ml-auto shrink-0 transition-colors"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// ScanResultsPanel — renders the appropriate result cards
// ---------------------------------------------------------------------------

function ScanResultsPanel({ results }: { results: ScanResults }) {
  if (results.type === "domain") {
    const { domain, whois, dns, ssl } = results.data;
    return (
      <section aria-label="Domain intelligence results">
        <SectionHeader
          icon={
            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
          }
          label="Domain Intelligence"
        />
        <div className="space-y-4">
          <DomainReputationCard data={domain} />
          {whois && <WHOISCard data={whois} />}
          {dns && <DNSCard data={dns} />}
          {ssl && <SSLCard data={ssl} />}
        </div>
      </section>
    );
  }

  if (results.type === "ip") {
    const { ip, geo, ports } = results.data;
    return (
      <section aria-label="IP intelligence results">
        <SectionHeader
          icon={
            <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
            </svg>
          }
          label="IP Intelligence"
        />
        <div className="space-y-4">
          <IPReputationCard data={ip} />
          {geo && <GeoCard data={geo} />}
          {ports && <OpenPortsCard data={ports} />}
        </div>
      </section>
    );
  }

  if (results.type === "email-headers") {
    return (
      <section aria-label="Email header analysis results">
        <SectionHeader
          icon={
            <svg className="w-4 h-4 text-violet-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
          }
          label="Email Header Analysis"
        />
        <EmailHeaderCard data={results.data} />
      </section>
    );
  }

  if (results.type === "phone") {
    return (
      <section aria-label="Phone number validation results">
        <SectionHeader
          icon={
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
            </svg>
          }
          label="Phone Number Validation"
        />
        <PhoneCard data={results.data} />
      </section>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#131929] border border-[#1e2d4a]">
        {icon}
      </span>
      <h2 className="text-sm font-semibold text-slate-300">{label}</h2>
      <div className="flex-1 h-px bg-[#1e2d4a]" />
    </div>
  );
}
