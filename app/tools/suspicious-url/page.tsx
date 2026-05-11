"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rebrand.ly", "is.gd", "ow.ly", "buff.ly", "goo.gl", "tiny.cc"];
const RISKY_TLDS = [".zip", ".xyz", ".top", ".click", ".country", ".loan", ".gq", ".cf", ".tk", ".rest", ".support"];
const SUSPECT_KEYWORDS = ["login", "verify", "secure", "update", "account", "password", "reset", "auth", "signin", "wallet", "validate", "billing"];

function analyseUrl(raw: string) {
  const indicators: string[] = [];
  const warnings: string[] = [];
  if (!raw.trim()) return { indicators, warnings, score: 0, hostname: "" };

  let url: URL | null = null;
  try {
    url = new URL(raw.startsWith("http") ? raw : `http://${raw}`);
  } catch {
    indicators.push("URL could not be parsed — verify it's a valid address.");
    return { indicators, warnings, score: 60, hostname: "" };
  }

  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();
  const query = url.search.toLowerCase();

  let score = 0;

  if (url.protocol === "http:") {
    indicators.push("Uses plain HTTP — no transport encryption.");
    score += 15;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    indicators.push("Hostname is a raw IPv4 address — almost never legitimate for branded services.");
    score += 30;
  }
  if (SHORTENERS.includes(host)) {
    indicators.push(`URL shortener (${host}) — destination not visible. Expand before clicking.`);
    score += 20;
  }
  if (RISKY_TLDS.some((tld) => host.endsWith(tld))) {
    indicators.push(`High-risk TLD (${host}).`);
    score += 20;
  }
  if (host.length > 35) {
    indicators.push("Hostname is unusually long.");
    score += 5;
  }
  if ((host.match(/-/g) || []).length >= 3) {
    indicators.push("Hostname contains multiple hyphens — common in look-alike domains.");
    score += 10;
  }
  if (/[а-я]|[α-ω]/i.test(host)) {
    indicators.push("Hostname contains non-Latin characters — possible IDN homoglyph attack.");
    score += 30;
  }
  if (host.match(/(micros[o0]ft|g00gle|paypa1|app1e|amaz0n|netfli[x]?[ck])/)) {
    indicators.push("Hostname appears to mimic a major brand (homoglyph).");
    score += 30;
  }
  if (url.username || url.password) {
    indicators.push("URL contains an embedded username/password — classic credential-trick.");
    score += 30;
  }
  if (url.port && !["80", "443"].includes(url.port)) {
    indicators.push(`Unusual port: ${url.port}.`);
    score += 10;
  }
  const matchedKw = SUSPECT_KEYWORDS.filter((kw) => path.includes(kw) || query.includes(kw));
  if (matchedKw.length > 0) {
    indicators.push(`Credential-related keywords in path/query: ${matchedKw.join(", ")}.`);
    score += matchedKw.length * 6;
  }
  if (path.length > 60) {
    indicators.push("Very long path — often used to hide the real domain visually.");
    score += 5;
  }
  if (path.match(/redirect|goto|out\?|url=|next=/i)) {
    indicators.push("Open-redirect parameter detected — verify destination before clicking.");
    warnings.push("Open-redirect risk — could chain into a phishing page.");
    score += 15;
  }

  if (indicators.length === 0) indicators.push("No strong red flags detected from URL syntax alone.");

  score = Math.max(0, Math.min(100, score));
  return { indicators, warnings, score, hostname: host };
}

function verdict(score: number) {
  if (score >= 70) return { label: "Likely malicious", tone: "rose" };
  if (score >= 40) return { label: "Suspicious", tone: "amber" };
  if (score >= 20) return { label: "Inspect before clicking", tone: "yellow" };
  return { label: "Looks benign", tone: "emerald" };
}

export default function SuspiciousUrlPage() {
  return (
    <GeneratorTool
      title="Suspicious URL Checker"
      description="Inspect a URL for syntactic phishing indicators — shorteners, homoglyphs, risky TLDs, embedded credentials, suspicious keywords. Sanity-check before submitting to a real reputation feed."
      skill="URL parsing, IDN/homoglyph detection, phishing heuristics."
      why="A quick local check that catches the most obvious phishing patterns before users click."
      futureApi="Wire to Google Safe Browsing API, VirusTotal URL scan, or PhishTank for authoritative verdicts."
      outputBadge="Demo result · heuristics only — never click directly"
      inputs={[
        { id: "url", label: "URL to inspect", placeholder: "https://secure-microsofts.com/login?next=...", required: true, span: "full" },
      ]}
      renderResult={(v) => {
        if (!v.url) return null;
        const { score } = analyseUrl(v.url);
        const ver = verdict(score);
        const color =
          ver.tone === "rose" ? "border-rose-400/30 bg-rose-500/10 text-rose-200" :
          ver.tone === "amber" ? "border-amber-400/30 bg-amber-500/10 text-amber-200" :
          ver.tone === "yellow" ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-200" :
          "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
        return (
          <div className={`rounded-2xl border p-5 ${color}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">URL Risk (Demo)</p>
            <p className="mt-2 text-3xl font-bold">{score}<span className="text-base opacity-70">/100</span></p>
            <p className="mt-1 text-sm">Verdict: <span className="font-semibold">{ver.label}</span></p>
          </div>
        );
      }}
      generate={(v) => {
        if (!v.url) return "";
        const { indicators, warnings, score, hostname } = analyseUrl(v.url);
        const ver = verdict(score);
        const lines: string[] = [];
        lines.push(`# Suspicious URL Inspection (Demo)`);
        lines.push("");
        lines.push(`**URL:** ${v.url}`);
        lines.push(`**Hostname:** ${hostname || "—"}`);
        lines.push(`**Verdict:** ${ver.label} · **Score:** ${score}/100`);
        lines.push("");
        lines.push("## Risk indicators");
        for (const i of indicators) lines.push(`- ${i}`);
        if (warnings.length > 0) {
          lines.push("");
          lines.push("## Redirect warnings");
          for (const w of warnings) lines.push(`- ${w}`);
        }
        lines.push("");
        lines.push("## Advice");
        if (score >= 70) {
          lines.push("- Do not click. Submit to your phishing queue / abuse mailbox.");
          lines.push("- Add hostname to URL deny-list / Defender SafeLinks block.");
        } else if (score >= 40) {
          lines.push("- Inspect destination in a sandbox before any user-facing decision.");
          lines.push("- Cross-reference with VirusTotal or Google Safe Browsing.");
        } else if (score >= 20) {
          lines.push("- Manual review — confirm with sender via a trusted channel.");
        } else {
          lines.push("- Looks benign — still avoid clicking unexpected links.");
        }
        lines.push("");
        lines.push("---");
        lines.push("_Demo result — heuristics only. Hook up Safe Browsing / VirusTotal for live verdicts._");
        return lines.join("\n");
      }}
    />
  );
}
