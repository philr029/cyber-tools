"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const URGENCY_OPTIONS = [
  { value: "low", label: "Low — informational" },
  { value: "medium", label: "Medium — \"please review\"" },
  { value: "high", label: "High — \"urgent / final notice\"" },
  { value: "critical", label: "Critical — \"action required in 24h\"" },
];

const RED_FLAG_KEYWORDS = [
  "urgent", "verify", "password", "expire", "expired", "suspended",
  "click here", "confirm", "wire transfer", "invoice", "gift card",
  "security alert", "act now", "limited time", "reset", "unusual sign-in",
];

const SUSPICIOUS_TLDS = [".zip", ".xyz", ".top", ".click", ".country", ".loan", ".gq", ".cf"];

function scorePhishing(input: { sender: string; subject: string; links: string; urgency: string }): {
  score: number;
  flags: string[];
} {
  const flags: string[] = [];
  let score = 0;

  const senderLower = input.sender.toLowerCase();
  const subjectLower = input.subject.toLowerCase();
  const linksLower = input.links.toLowerCase();

  // Sender heuristics
  if (senderLower.match(/[0-9]{3,}/)) {
    flags.push("Sender address contains a long numeric run — common in spoofed mailboxes.");
    score += 15;
  }
  if (senderLower.match(/(no[-_]?reply|secure|verify|alert|service|account|support)/) && !senderLower.match(/microsoft|google|apple|amazon|paypal/)) {
    flags.push("Generic 'service'/'alert'/'verify' sender username — typical phishing pattern.");
    score += 10;
  }
  const senderDomain = senderLower.split("@")[1] ?? "";
  if (SUSPICIOUS_TLDS.some((tld) => senderDomain.endsWith(tld))) {
    flags.push(`Sender uses a high-risk TLD (${senderDomain}).`);
    score += 25;
  }
  if (senderDomain.match(/[a-z]+-[a-z]+\.[a-z]+/) && senderDomain.length > 18) {
    flags.push("Sender domain uses an unusually long hyphenated pattern — common in look-alikes.");
    score += 10;
  }
  if (senderLower.match(/(micros[o0]ft|g00gle|paypa1|app1e|amaz0n)/)) {
    flags.push("Sender domain appears to mimic a major brand (homoglyph).");
    score += 35;
  }

  // Subject heuristics
  const matchedKeywords = RED_FLAG_KEYWORDS.filter((kw) => subjectLower.includes(kw));
  if (matchedKeywords.length > 0) {
    flags.push(`Subject contains urgency / credential keywords: ${matchedKeywords.join(", ")}.`);
    score += Math.min(30, matchedKeywords.length * 8);
  }
  if (subjectLower.includes("re:") && !subjectLower.match(/[a-z]/)) {
    flags.push("Subject prefixed with 'Re:' but has no real conversation context.");
    score += 5;
  }

  // Link heuristics
  const linkList = linksLower
    .split(/[\s,;\n]+/)
    .filter((s) => s.length > 0);
  for (const link of linkList) {
    if (link.match(/bit\.ly|tinyurl|t\.co|cutt\.ly|rebrand\.ly|is\.gd|ow\.ly/)) {
      flags.push(`URL shortener detected: ${link}`);
      score += 15;
    }
    if (link.match(/\.(zip|xyz|top|click|country|loan|gq|cf)(\/|$)/)) {
      flags.push(`Link uses high-risk TLD: ${link}`);
      score += 20;
    }
    if (link.match(/[a-z0-9]{18,}\./)) {
      flags.push(`Link contains a long random-looking subdomain: ${link}`);
      score += 10;
    }
    if (link.match(/@/)) {
      flags.push(`Link uses '@' — common credential-prefix obfuscation trick.`);
      score += 25;
    }
    if (link.match(/[а-я]|[α-ω]|[\u00a0-\u024f]/i)) {
      flags.push(`Link contains non-Latin characters — possible IDN homoglyph.`);
      score += 25;
    }
  }
  if (linkList.length > 5) {
    flags.push("More than 5 links — unusual for a transactional email.");
    score += 5;
  }

  // Urgency
  const urgencyScore: Record<string, number> = { low: 0, medium: 10, high: 20, critical: 30 };
  score += urgencyScore[input.urgency] ?? 0;
  if (input.urgency === "critical" || input.urgency === "high") {
    flags.push("Pressure tactics (urgency) raise the phishing risk score significantly.");
  }

  if (flags.length === 0) {
    flags.push("No strong red flags detected by heuristics — still verify sender via a trusted channel.");
  }
  score = Math.max(0, Math.min(100, score));
  return { score, flags };
}

function verdict(score: number): { label: string; tone: string } {
  if (score >= 70) return { label: "Likely phishing", tone: "rose" };
  if (score >= 40) return { label: "Suspicious", tone: "amber" };
  if (score >= 20) return { label: "Low confidence — review", tone: "yellow" };
  return { label: "Looks benign", tone: "emerald" };
}

export default function PhishingEmailAnalyserPage() {
  return (
    <GeneratorTool
      title="Phishing Email Analyser"
      description="Score an email's phishing risk from a handful of fields — sender, subject, embedded links and urgency tone. Heuristics only; never trust the score alone."
      skill="Email security heuristics, URL parsing, IDN / homoglyph detection."
      why="Front-line triage before submitting to a real phishing queue — Defender, Proofpoint, Mimecast."
      futureApi="Wire to VirusTotal URL/scans, Microsoft Defender for Office 365 (Threat Explorer), or PhishTank for live verdicts."
      outputBadge="Demo result · heuristics only — never blindly trust"
      inputs={[
        { id: "sender", label: "Sender (From) address", placeholder: "security-alerts@microsofts-login.com", required: true, span: "full" },
        { id: "subject", label: "Email subject", placeholder: "URGENT: Your password expires today", required: true, span: "full" },
        { id: "links", label: "Embedded link(s)", type: "textarea", placeholder: "Paste any links found in the body, one per line.", span: "full" },
        { id: "urgency", label: "Urgency tone", type: "select", options: URGENCY_OPTIONS, defaultValue: "medium" },
      ]}
      renderResult={(v) => {
        if (!v.sender && !v.subject) return null;
        const { score } = scorePhishing({
          sender: v.sender ?? "",
          subject: v.subject ?? "",
          links: v.links ?? "",
          urgency: v.urgency ?? "low",
        });
        const ver = verdict(score);
        const color =
          ver.tone === "rose" ? "border-rose-400/30 bg-rose-500/10 text-rose-200" :
          ver.tone === "amber" ? "border-amber-400/30 bg-amber-500/10 text-amber-200" :
          ver.tone === "yellow" ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-200" :
          "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
        return (
          <div className={`rounded-2xl border p-5 ${color}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">Phishing Risk (Demo)</p>
            <p className="mt-2 text-3xl font-bold">{score}<span className="text-base opacity-70">/100</span></p>
            <p className="mt-1 text-sm">Verdict: <span className="font-semibold">{ver.label}</span></p>
          </div>
        );
      }}
      generate={(v) => {
        if (!v.sender && !v.subject) return "";
        const { score, flags } = scorePhishing({
          sender: v.sender ?? "",
          subject: v.subject ?? "",
          links: v.links ?? "",
          urgency: v.urgency ?? "low",
        });
        const ver = verdict(score);
        const lines: string[] = [];
        lines.push(`# Phishing Email Analysis (Demo)`);
        lines.push("");
        lines.push(`**Verdict:** ${ver.label} · **Score:** ${score}/100`);
        lines.push("");
        lines.push(`**Sender:** ${v.sender || "—"}`);
        lines.push(`**Subject:** ${v.subject || "—"}`);
        lines.push(`**Urgency tone:** ${v.urgency || "—"}`);
        lines.push("");
        lines.push("## Red flags");
        for (const f of flags) lines.push(`- ${f}`);
        lines.push("");
        lines.push("## Recommended action");
        if (score >= 70) {
          lines.push("- **Quarantine.** Submit to Defender for Office 365 / SOC for tenant-wide takedown.");
          lines.push("- Block sender domain and reset any credentials that may have been entered.");
        } else if (score >= 40) {
          lines.push("- Treat as suspicious — verify with sender via a known good channel.");
          lines.push("- Submit to your phishing queue for second-opinion analysis.");
        } else if (score >= 20) {
          lines.push("- Manual review recommended; check link destinations in a sandbox.");
        } else {
          lines.push("- Looks benign — still confirm sender on first contact requests.");
        }
        lines.push("");
        lines.push("---");
        lines.push("_Demo result — heuristics only. Hook up VirusTotal / Defender threat explorer for authoritative verdicts._");
        return lines.join("\n");
      }}
    />
  );
}
