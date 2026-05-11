"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

interface Flag {
  id: string;
  label: string;
  level: "info" | "warn" | "high";
  matched: boolean;
}

const SUSPICIOUS_TLD = new Set(["zip", "mov", "click", "country", "gq", "tk", "cf", "rest", "support", "top", "xyz"]);
const SHORTENERS = new Set(["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "lnkd.in"]);
const BRAND_KEYWORDS = ["paypal", "microsoft", "office365", "apple", "amazon", "hsbc", "barclays", "google", "outlook", "netflix", "dhl", "fedex"];

export default function PhishingUrlChecklistPage() {
  const [input, setInput] = useState("");

  const analysis = useMemo(() => analyse(input.trim()), [input]);

  return (
    <ToolPageLayout
      title="Phishing URL Checklist"
      description="Paste a suspicious URL and we'll run lightweight heuristics — TLD reputation, brand keyword squatting, IDN tricks, shortener detection, excessive subdomains. Use alongside VirusTotal & Defender for Office 365 for a verdict."
    >
      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <label className="block text-xs font-medium text-white/70 mb-1">URL to inspect</label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://login.micr0soft-secure-update.click/verify"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        />
        <p className="mt-2 text-[11px] text-white/45">Heuristics run in your browser. Nothing is sent to a server. <span className="text-amber-300">Demo result</span> — confirm with a real reputation service before acting.</p>
      </div>

      {analysis && (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/30 p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                analysis.score >= 5
                  ? "bg-rose-500/20 text-rose-200"
                  : analysis.score >= 3
                  ? "bg-amber-500/20 text-amber-200"
                  : "bg-emerald-500/20 text-emerald-200"
              }`}
            >
              Risk score: {analysis.score} / 9
            </span>
            <span className="text-xs text-white/55">{analysis.host}</span>
          </div>

          <ul className="space-y-2 text-xs">
            {analysis.flags.map((f) => (
              <li
                key={f.id}
                className={`rounded-xl border px-3 py-2 ${
                  !f.matched
                    ? "border-white/5 bg-black/20 text-white/45"
                    : f.level === "high"
                    ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
                    : f.level === "warn"
                    ? "border-amber-400/30 bg-amber-500/10 text-amber-100"
                    : "border-cyan-400/30 bg-cyan-500/10 text-cyan-100"
                }`}
              >
                <span className="font-semibold mr-2">{f.matched ? "⚠" : "•"}</span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-[24px] border border-cyan-400/20 bg-cyan-500/5 p-4 text-xs leading-6 text-cyan-100/80">
        <p className="font-semibold mb-1">Future API hook</p>
        <p>Combine with the existing VirusTotal URL Analysis tool, AbuseIPDB for hosting IP reputation, and Microsoft Defender for Office 365 / Threat Explorer for tenant signals.</p>
      </div>
    </ToolPageLayout>
  );
}

function analyse(value: string) {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  const tld = host.split(".").slice(-1)[0];
  const labels = host.split(".");
  const path = url.pathname.toLowerCase();

  const flags: Flag[] = [
    {
      id: "f-ip",
      label: "Hostname is a raw IP address",
      level: "high",
      matched: /^\d{1,3}(\.\d{1,3}){3}$/.test(host),
    },
    {
      id: "f-tld",
      label: `Top-level domain '.${tld}' is in the abuse-heavy list`,
      level: "high",
      matched: SUSPICIOUS_TLD.has(tld),
    },
    {
      id: "f-idn",
      label: "Contains Punycode / IDN (xn--) — possible homoglyph attack",
      level: "high",
      matched: host.includes("xn--"),
    },
    {
      id: "f-subs",
      label: "Excessive subdomains (>3 dots) — common in URL hiding",
      level: "warn",
      matched: labels.length > 4,
    },
    {
      id: "f-brand",
      label: "Hostname contains a famous brand keyword without being on its real domain",
      level: "high",
      matched: BRAND_KEYWORDS.some((b) => host.replace(/[0o]/g, "o").includes(b) && !host.endsWith(`.${b}.com`)),
    },
    {
      id: "f-short",
      label: "URL uses a known link shortener — destination is hidden",
      level: "warn",
      matched: SHORTENERS.has(host),
    },
    {
      id: "f-dash",
      label: "Hostname contains many hyphens (often used to mimic brands)",
      level: "warn",
      matched: (host.match(/-/g) || []).length >= 3,
    },
    {
      id: "f-at",
      label: "URL contains '@' — could redirect to a different host",
      level: "high",
      matched: value.includes("@") && !value.startsWith("mailto:"),
    },
    {
      id: "f-keywords",
      label: "URL path contains 'login', 'verify', 'update', 'secure', or 'wallet'",
      level: "warn",
      matched: /(login|verify|update|secure|wallet|password|account)/.test(path),
    },
  ];

  const weight = (f: Flag) => (f.matched ? (f.level === "high" ? 2 : 1) : 0);
  const score = flags.reduce((acc, f) => acc + weight(f), 0);

  return { host, flags, score };
}
