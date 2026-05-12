"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { BracketsCurly, ClockCounterClockwise, FileMagnifyingGlass, GlobeHemisphereWest, UserCircle } from "@phosphor-icons/react";
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
import { sanitizeMultilineInput, sanitizeSingleLineInput } from "@/lib/input-sanitization";
import { useActivityConsole } from "@/lib/use-activity-console";
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
import LiveActivityConsole from "@/app/components/tools/LiveActivityConsole";
import SecuritySignals from "@/app/components/tools/SecuritySignals";
import SecuritySuiteCard from "@/app/components/tools/SecuritySuiteCard";

interface SuiteCard {
  href: string;
  title: string;
  description: string;
  badge: string;
  cornerTag?: string;
  category: string;
  size?: "square" | "wide";
  emphasis?: "cyan" | "violet" | "emerald" | "amber" | "rose";
  active?: boolean;
  preview?: boolean;
  icon: ReactNode;
}

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

const SUITE_GROUPS: Array<{ title: string; description: string; tools: SuiteCard[] }> = [
  {
    title: "Security Ops",
    description: "Priority technical modules for core external attack-surface validation and offensive-safe diagnostics.",
    tools: [
      {
        href: "/tools/domain-lookup",
        title: "Domain Reputation",
        description: "High-priority intelligence card with multi-engine threat verdicts and vendor confidence signals.",
        badge: "Priority",
        category: "Intel",
        size: "wide",
        emphasis: "violet",
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/tools/port-scanner",
        title: "Port Scanner",
        description: "Safe-mode common-port reachability checks with hardened authorization review before execution.",
        badge: "Priority",
        category: "Active",
        size: "wide",
        emphasis: "cyan",
        active: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M2 5a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm6 0a1 1 0 012 0v2h2V5a1 1 0 112 0v2a2 2 0 01-2 2H9a2 2 0 01-2-2V5zm-1 7a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/tools/api-tester",
        title: "API Tester",
        description: "Proxy outbound HTTP requests through the encrypted control plane with read-only response inspection.",
        badge: "Secure Proxy",
        category: "Validation",
        emphasis: "violet",
        active: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ),
      },
      {
        href: "/tools/form-tester",
        title: "Form Testing",
        description: "Submit forms through a server-side relay and audit CSRF, redirect, and disclosure indicators.",
        badge: "Secure Relay",
        category: "Validation",
        emphasis: "rose",
        active: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Advanced OSINT",
    description: "Higher-fidelity reconnaissance modules for entity tracing, metadata inspection, and internet-wide exposure discovery.",
    tools: [
      {
        href: "/tools/coming-soon?k=username-footprint",
        title: "Username Footprint",
        description: "Trace public account reuse across platforms. Spot naming collisions and exposure patterns quickly.",
        badge: "Preview",
        category: "Recon",
        emphasis: "violet",
        preview: true,
        icon: <UserCircle className="h-6 w-6 text-white" weight="regular" aria-hidden="true" />,
      },
      {
        href: "/tools/coming-soon?k=metadata-scraper",
        title: "Metadata Scraper",
        description: "Extract visible file and page metadata safely. Surface attribution clues and hidden context fields.",
        badge: "Preview",
        cornerTag: "Client-Side Only: No Data Stored",
        category: "Forensics",
        emphasis: "amber",
        preview: true,
        icon: <FileMagnifyingGlass className="h-6 w-6 text-white" weight="regular" aria-hidden="true" />,
      },
      {
        href: "/tools/coming-soon?k=shodan-explorer",
        title: "Shodan Explorer",
        description: "Pivot through exposed services and banners fast. Triage internet-facing assets by risk signals.",
        badge: "Preview",
        category: "Exposure",
        emphasis: "cyan",
        preview: true,
        icon: <GlobeHemisphereWest className="h-6 w-6 text-white" weight="regular" aria-hidden="true" />,
      },
    ],
  },
  {
    title: "IT Admin",
    description: "Operational diagnostics for certificates, naming infrastructure, and distributed endpoint performance.",
    tools: [
      {
        href: "/tools/ssl-checker",
        title: "SSL/TLS Inspector",
        description: "Inspect certificate validity, issuer chains, protocol posture, and cryptographic hygiene.",
        badge: "Live",
        category: "Certificates",
        emphasis: "emerald",
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/tools/dns-lookup",
        title: "DNS Record Explorer",
        description: "Traverse MX, TXT, A, AAAA, and NS records in a tidy operations-ready output pane.",
        badge: "Live",
        category: "DNS",
        emphasis: "cyan",
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
          </svg>
        ),
      },
      {
        href: "/tools/coming-soon?k=global-latency",
        title: "Global Latency Check",
        description: "Preview worldwide response timing checks and route quality baselines for distributed services.",
        badge: "Preview",
        category: "Network",
        emphasis: "amber",
        preview: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.03-10.28a.75.75 0 10-1.06-1.06L9.47 9.16 8.28 7.97a.75.75 0 10-1.06 1.06l1.72 1.72a.75.75 0 001.06 0l2.97-3.03z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Marketing / SEO",
    description: "Publishing and growth modules for metadata validation, search result previews, and campaign link hygiene.",
    tools: [
      {
        href: "/tools/coming-soon?k=og-preview",
        title: "OG Tag Previewer",
        description: "Inspect Open Graph and social card presentation before content goes live.",
        badge: "Preview",
        category: "Social",
        emphasis: "violet",
        preview: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 4.75A1.75 1.75 0 014.75 3h10.5A1.75 1.75 0 0117 4.75v6.5A1.75 1.75 0 0115.25 13H4.75A1.75 1.75 0 013 11.25v-6.5z" />
            <path d="M4.5 15.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" />
          </svg>
        ),
      },
      {
        href: "/tools/coming-soon?k=serp-visualizer",
        title: "SERP Visualizer",
        description: "Model title, description, and rich-result presentation in a search-engine styled viewport.",
        badge: "Preview",
        category: "Search",
        emphasis: "emerald",
        preview: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/tools/coming-soon?k=utm-architect",
        title: "UTM Architect",
        description: "Build clean, validated campaign URLs with tracking parameter governance built in.",
        badge: "Preview",
        category: "Campaigns",
        emphasis: "cyan",
        preview: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
            <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Dev Utility",
    description: "Developer-focused helpers for token inspection and schedule translation during engineering workflows.",
    tools: [
      {
        href: "/tools/coming-soon?k=jwt-decoder",
        title: "JWT Decoder",
        description: "Decode token headers and claims instantly. Review expiry, issuer, and audience values at a glance.",
        badge: "Preview",
        category: "Tokens",
        emphasis: "emerald",
        preview: true,
        icon: <BracketsCurly className="h-6 w-6 text-white" weight="regular" aria-hidden="true" />,
      },
      {
        href: "/tools/coming-soon?k=cron-job-translator",
        title: "Cron Job Translator",
        description: "Convert cron expressions into plain language. Validate run cadence before deployment or handoff.",
        badge: "Preview",
        category: "Scheduling",
        emphasis: "rose",
        preview: true,
        icon: <ClockCounterClockwise className="h-6 w-6 text-white" weight="regular" aria-hidden="true" />,
      },
    ],
  },
  {
    title: "Compliance",
    description: "Review public web-facing policy and consent signals from a privacy and governance perspective.",
    tools: [
      {
        href: "/tools/coming-soon?k=privacy-policy-scanner",
        title: "Privacy Policy Scanner",
        description: "Detect key policy sections, missing disclosures, and transparency gaps across public pages.",
        badge: "Preview",
        category: "Governance",
        emphasis: "amber",
        preview: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5 3.25A2.25 2.25 0 017.25 1h5.5A2.25 2.25 0 0115 3.25v13.5A2.25 2.25 0 0112.75 19h-5.5A2.25 2.25 0 015 16.75V3.25zM8 5a.75.75 0 000 1.5h4a.75.75 0 000-1.5H8zm0 4a.75.75 0 000 1.5h4a.75.75 0 000-1.5H8zm0 4a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5H8z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/tools/coming-soon?k=cookie-audit",
        title: "Cookie Tracker Audit",
        description: "Enumerate first- and third-party tracking signals to support consent and policy reviews.",
        badge: "Preview",
        category: "Consent",
        emphasis: "rose",
        preview: true,
        icon: (
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 01-8-8 .75.75 0 011.28-.53 2.75 2.75 0 003.89 0 .75.75 0 011.06 0 2.75 2.75 0 003.89 0 .75.75 0 011.06 0 2.75 2.75 0 003.89 0 .75.75 0 011.28.53 8 8 0 01-8 8zM7 5.75A1.25 1.25 0 118.25 7 1.25 1.25 0 017 5.75zm4.5-1a1 1 0 111 1 1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
];

function TypeBadge({ inputType }: { inputType: InputType }) {
  const info = INPUT_TYPE_INFO[inputType];
  if (inputType === "unknown") return null;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${info.bgColor} ${info.color} ${info.ringColor}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${info.dotColor}`} />
      Detected {info.label}
    </span>
  );
}

export default function ToolsPage() {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<InputType>("unknown");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { entries, log } = useActivityConsole([
    { level: "info", message: "Security suite armed. Awaiting sanitized target input." },
  ]);

  useEffect(() => {
    setInputType(detectInputType(input));
  }, [input]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxHeight = 260;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
    ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  const handleScan = useCallback(async () => {
    const trimmed = inputType === "email-headers"
      ? sanitizeMultilineInput(input, { maxLength: 20000 })
      : sanitizeSingleLineInput(input);

    if (!trimmed || inputType === "unknown") return;

    log("info", "Sanitizing input and routing to the correct analysis pipeline.");
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

        log("success", sslRes.status === "fulfilled" ? "Connection secure. Domain intelligence and TLS posture loaded." : "Domain intelligence loaded with partial source availability.");
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

        log("success", "Encrypted lookup channel established. IP reputation and reachability results collected.");
        return;
      }

      if (inputType === "email-headers") {
        const { data } = await analyseEmailHeaders(trimmed);
        setResults({ type: "email-headers", data });
        log("success", "Email header analysis completed without storing raw submission data.");
        return;
      }

      if (inputType === "phone") {
        const { data } = await lookupPhone(trimmed);
        setResults({ type: "phone", data });
        log("success", "Phone validation completed through the encrypted request path.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Scan failed. Please try again.";
      setError(message);
      log("error", message);
    } finally {
      setLoading(false);
    }
  }, [input, inputType, log]);

  function handleInputChange(rawValue: string) {
    const shouldTreatAsMultiline = rawValue.includes("\n") || inputType === "email-headers";
    const sanitized = shouldTreatAsMultiline
      ? sanitizeMultilineInput(rawValue, { trim: false, maxLength: 20000 })
      : sanitizeSingleLineInput(rawValue, { trim: false, maxLength: 4096, collapseSpaces: false });

    if (sanitized != rawValue) {
      log("info", "Sanitizing input to neutralize control characters and unsafe payload fragments.");
    }

    setInput(sanitized);
    setResults(null);
    setError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void handleScan();
    }
  }

  const toolCount = SUITE_GROUPS.reduce((total, group) => total + group.tools.length, 0);
  const priorityCount = SUITE_GROUPS.flatMap((group) => group.tools).filter((tool) => tool.size === "wide").length;
  const activeCount = SUITE_GROUPS.flatMap((group) => group.tools).filter((tool) => tool.active).length;
  const canSubmit = !loading && input.trim().length > 0 && inputType !== "unknown";
  const isEmailHeadersInput = inputType === "email-headers" || input.includes("\n");

  return (
    <main className="security-suite-shell flex-1 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[36px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_30%),#050505] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
            <div className="rounded-[32px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Security-First Technical Suite
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Deep obsidian workspace for intelligence, diagnostics, and compliance review.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
                Run unified scans, pivot into priority tools, and review trusted request telemetry inside a tidy bento-grid control surface.
              </p>
              <div className="mt-6">
                <SecuritySignals />
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Modules" value={toolCount.toString()} detail="Cross-functional suite" />
                <MetricCard label="Priority Cards" value={priorityCount.toString()} detail="Wide bento emphasis" />
                <MetricCard label="Active Tools" value={activeCount.toString()} detail="Two-step confirmation" />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Unified Intake</p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                Domains, IPs, phone numbers, or raw email headers are sanitized in-browser before analysis.
              </p>
              <div className="mt-5 space-y-3 text-sm text-white/55">
                <p>• Input sanitization runs on every keystroke.</p>
                <p>• Response handling stays read-only inside the console.</p>
                <p>• Encrypted transport and no-log trust badges remain visible during every request.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[32px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Core Tools Engine</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Adaptive threat and infrastructure lookup</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {input.trim() ? <TypeBadge inputType={inputType} /> : null}
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/45">
                  Cmd/Ctrl + Enter to execute
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => handleInputChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isEmailHeadersInput
                    ? "Paste raw email headers here…"
                    : "Enter a domain, IP, phone number, or paste raw email headers…"
                }
                rows={isEmailHeadersInput ? 8 : 2}
                disabled={loading}
                className={`w-full rounded-[28px] border bg-black/30 px-5 py-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/25 resize-none transition ${input.trim() && inputType !== "unknown" ? "border-cyan-400/20" : "border-white/10"} ${isEmailHeadersInput ? "font-mono text-xs leading-6" : "leading-7"}`}
                aria-label="Scan input"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-white/45">
                  {!input.trim() ? (
                    <>
                      Try:{" "}
                      {["example.com", "8.8.8.8", "+1 202 555 0199"].map((example, index) => (
                        <span key={example}>
                          {index > 0 && " · "}
                          <button
                            type="button"
                            onClick={() => {
                              setInput(sanitizeSingleLineInput(example, { trim: false }));
                              setResults(null);
                              setError(null);
                            }}
                            className="text-cyan-200 transition hover:text-cyan-100 hover:underline"
                          >
                            {example}
                          </button>
                        </span>
                      ))}
                    </>
                  ) : inputType === "unknown" ? (
                    <span className="text-amber-200">Input not recognized. Use a valid domain, IP, phone number, or raw headers.</span>
                  ) : (
                    <span>Sanitized target ready for execution.</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void handleScan()}
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.2)] transition hover:from-cyan-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Scanning…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Execute Secure Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-8">
              <LoadingSpinner
                label={`Running ${INPUT_TYPE_INFO[inputType]?.label ?? "scan"}…`}
                sublabel="Requesting intelligence sources through the hardened pipeline."
              />
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          {!loading && !error && results && (
            <div className="mt-8 rounded-[32px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <ScanResultsPanel results={results} />
            </div>
          )}

          <div className="mt-10 space-y-10">
            {SUITE_GROUPS.map((group) => (
              <section key={group.title}>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">{group.title}</p>
                    <p className="mt-1 text-sm leading-7 text-white/60">{group.description}</p>
                  </div>
                </div>
                <div className="security-bento-grid">
                  {group.tools.map((tool) => (
                    <SecuritySuiteCard key={tool.href} {...tool} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <LiveActivityConsole entries={entries} />
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/45">{detail}</p>
    </div>
  );
}

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

function SectionHeader({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
        {icon}
      </span>
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">{label}</h2>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}
