"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

const SUSPICIOUS_TLDS = new Set([
  "zip",
  "mov",
  "click",
  "country",
  "stream",
  "gq",
  "tk",
  "ml",
  "cf",
  "xyz",
  "top",
  "live",
  "win",
  "rest",
]);
const PHISHING_KEYWORDS = [
  "login",
  "secure",
  "verify",
  "account",
  "update",
  "wallet",
  "bonus",
  "free",
  "gift",
  "support",
  "billing",
  "invoice",
  "delivery",
  "fedex",
  "ups",
  "dhl",
  "microsoft",
  "office365",
  "outlook",
  "apple",
  "icloud",
  "paypal",
  "hmrc",
  "irs",
];

interface Finding {
  level: "info" | "warn" | "high";
  message: string;
}

interface Result {
  risk: "Low" | "Medium" | "High";
  score: number;
  findings: Finding[];
  url?: URL;
}

function analyse(input: string): Result {
  const findings: Finding[] = [];
  let score = 0;
  let url: URL | null = null;
  try {
    url = new URL(input.trim());
  } catch {
    findings.push({ level: "high", message: "Not a valid URL." });
    return { risk: "High", score: 5, findings };
  }

  const host = url.hostname.toLowerCase();
  const full = url.href.toLowerCase();

  if (url.protocol !== "https:") {
    findings.push({ level: "high", message: "Uses HTTP instead of HTTPS — credentials would be sent in clear." });
    score += 2;
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    findings.push({ level: "high", message: "Hostname is a raw IP address — extremely unusual for legitimate brands." });
    score += 3;
  }

  const labels = host.split(".");
  const tld = labels.at(-1) ?? "";
  if (SUSPICIOUS_TLDS.has(tld)) {
    findings.push({ level: "high", message: `TLD .${tld} is frequently abused for free / disposable hosting.` });
    score += 2;
  }

  if (labels.length > 4) {
    findings.push({ level: "warn", message: `Hostname has ${labels.length} labels — many subdomains can hide the real domain.` });
    score += 1;
  }

  if (host.length > 40) {
    findings.push({ level: "warn", message: "Hostname is long (>40 chars) — often used to bury the real domain." });
    score += 1;
  }

  if (url.href.length > 100) {
    findings.push({ level: "warn", message: `URL is long (${url.href.length} chars) — common in mass-mailed phishing.` });
    score += 1;
  }

  if (/[^\x00-\x7F]/.test(host)) {
    findings.push({ level: "high", message: "Hostname contains non-ASCII characters — possible homograph attack." });
    score += 2;
  }
  if (/-/.test(host) && /(?:secure|verify|login|update|account)/.test(host)) {
    findings.push({ level: "high", message: "Hostname mixes hyphens and trust words ('secure', 'verify' etc) — classic lookalike pattern." });
    score += 2;
  }

  for (const kw of PHISHING_KEYWORDS) {
    if (full.includes(kw)) {
      findings.push({ level: "warn", message: `Contains the keyword '${kw}'.` });
      score += 0.4;
      break;
    }
  }

  if (url.username || url.password) {
    findings.push({ level: "high", message: "URL contains embedded credentials (user:password@) — almost always malicious." });
    score += 3;
  }

  let risk: Result["risk"] = "Low";
  if (score >= 4) risk = "High";
  else if (score >= 2) risk = "Medium";

  if (findings.length === 0) {
    findings.push({ level: "info", message: "No obvious red flags from heuristic checks." });
  }

  return { risk, score, findings, url: url ?? undefined };
}

export default function PhishingLinkPage() {
  const [input, setInput] = useState("http://secure-microsoft-login.contoso-update.click/account/verify");
  const result = useMemo(() => analyse(input), [input]);

  const summary = useMemo(
    () =>
      [
        `# Phishing link heuristic`,
        ``,
        `URL: ${input}`,
        `Risk: ${result.risk}`,
        ``,
        `## Findings`,
        ...result.findings.map((f) => `- [${f.level.toUpperCase()}] ${f.message}`),
        ``,
        `> Heuristic only — always pair with a real reputation source (VirusTotal, Microsoft Defender Safe Links, Google Safe Browsing) before deciding.`,
      ].join("\n"),
    [input, result],
  );

  const riskColor =
    result.risk === "High"
      ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
      : result.risk === "Medium"
        ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
        : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200";

  return (
    <ToolPageLayout
      title="Phishing Link Analyser"
      description="Paste a suspicious URL and get a quick heuristic risk rating (Low / Medium / High) based on protocol, TLD, subdomain depth, length, embedded credentials and phishing keywords."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="URL forensics, phishing triage." accent="cyan" />
        <Meta label="Why" body="Fast first-look before you decide what to escalate." accent="violet" />
        <Meta
          label="Disclaimer"
          body="Heuristic only. Always confirm with VirusTotal, Defender / Safe Links, or Google Safe Browsing before action."
          accent="emerald"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Suspicious URL</span>
            <textarea
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
          </label>
          <p className="mt-2 text-[11px] leading-5 text-white/45">
            Note: this tool intentionally does not fetch the URL. Heuristics only — no requests leave the browser.
          </p>
        </div>

        <div className="space-y-3">
          <div className={`rounded-[24px] border p-4 ${riskColor}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-80">Risk</p>
            <p className="mt-2 text-2xl font-bold">{result.risk}</p>
            <p className="mt-1 text-xs text-white/70">Score: {result.score.toFixed(1)} · {result.findings.length} finding(s)</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">Findings</p>
            <ul className="mt-2 space-y-1 text-sm">
              {result.findings.map((f, i) => (
                <li
                  key={i}
                  className={
                    f.level === "high"
                      ? "text-rose-200"
                      : f.level === "warn"
                        ? "text-amber-200"
                        : "text-emerald-200"
                  }
                >
                  • {f.message}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Analysis (Markdown)
              </p>
              <CopyButton text={summary} label="Copy report" />
            </div>
            <pre className="max-h-60 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre-wrap">
{summary}
            </pre>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}

function Meta({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}
