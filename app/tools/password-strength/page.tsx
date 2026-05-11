"use client";

import { useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "123456", "12345678", "qwerty",
  "letmein", "admin", "welcome", "monkey", "abc123", "iloveyou", "summer2024",
  "winter2024", "spring2025", "summer2025", "autumn2025", "winter2025", "summer2026",
  "trustno1", "dragon", "passw0rd", "p@ssword", "p@ssw0rd",
]);

function analyse(pw: string) {
  const length = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const uniqueChars = new Set(pw).size;

  const weaknesses: string[] = [];
  let score = 0;

  if (length === 0) {
    return { score: 0, label: "—", weaknesses: ["Enter a password to evaluate."], entropy: 0, length, hasLower, hasUpper, hasDigit, hasSymbol };
  }

  score += Math.min(40, length * 3);
  if (hasLower) score += 5;
  if (hasUpper) score += 5;
  if (hasDigit) score += 5;
  if (hasSymbol) score += 10;
  score += Math.min(15, Math.floor((uniqueChars / Math.max(1, length)) * 15));

  if (length < 12) weaknesses.push("Less than 12 characters — modern guidance is 14+.");
  if (!hasUpper || !hasLower) weaknesses.push("Missing mixed-case letters.");
  if (!hasDigit) weaknesses.push("Missing digits.");
  if (!hasSymbol) weaknesses.push("Missing symbols.");
  if (uniqueChars / Math.max(1, length) < 0.5) weaknesses.push("Many repeated characters.");
  if (/(.)\1\1/.test(pw)) {
    weaknesses.push("Contains a run of 3 or more identical characters.");
    score -= 10;
  }
  if (/0123|1234|2345|3456|4567|5678|6789|abcd|qwerty|asdf|zxcv/i.test(pw)) {
    weaknesses.push("Contains a common keyboard or numeric sequence.");
    score -= 15;
  }
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) {
    weaknesses.push("Matches a well-known compromised password.");
    score = Math.min(score, 5);
  }
  // Entropy approximation
  let charset = 0;
  if (hasLower) charset += 26;
  if (hasUpper) charset += 26;
  if (hasDigit) charset += 10;
  if (hasSymbol) charset += 33;
  const entropy = charset > 0 ? Math.round(length * Math.log2(charset)) : 0;

  score = Math.max(0, Math.min(100, score));
  let label = "Very weak";
  if (score >= 80) label = "Excellent";
  else if (score >= 65) label = "Strong";
  else if (score >= 50) label = "Reasonable";
  else if (score >= 30) label = "Weak";

  if (weaknesses.length === 0) weaknesses.push("Looks strong — keep it unique to this site.");

  return { score, label, weaknesses, entropy, length, hasLower, hasUpper, hasDigit, hasSymbol };
}

function suggestions(pw: string) {
  const ideas: string[] = [];
  ideas.push("Use a passphrase: 4 random unrelated words + 2 digits + a symbol.");
  ideas.push("Aim for 14+ characters with mixed case, digits and symbols.");
  ideas.push("Never reuse a password across accounts — store unique values in a password manager.");
  if (pw && pw.length < 14) ideas.push(`Add ${14 - pw.length} more character(s) to reach the recommended length.`);
  if (pw && !/[^A-Za-z0-9]/.test(pw)) ideas.push("Add at least one symbol such as ! @ # $ % &.");
  ideas.push("Enable MFA wherever possible — passwords are step zero.");
  return ideas;
}

export default function PasswordStrengthPage() {
  const [pw, setPw] = useState("");
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyse(pw), [pw]);
  const tips = useMemo(() => suggestions(pw), [pw]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const tone =
    result.score >= 80 ? "emerald" :
    result.score >= 65 ? "cyan" :
    result.score >= 50 ? "yellow" :
    result.score >= 30 ? "amber" : "rose";
  const toneClass: Record<string, string> = {
    emerald: "from-emerald-500 to-teal-500 text-emerald-100 border-emerald-400/30",
    cyan: "from-cyan-500 to-sky-500 text-cyan-100 border-cyan-400/30",
    yellow: "from-yellow-500 to-amber-500 text-yellow-50 border-yellow-400/30",
    amber: "from-amber-500 to-orange-500 text-amber-50 border-amber-400/30",
    rose: "from-rose-500 to-red-500 text-rose-50 border-rose-400/30",
  };

  const report = useMemo(() => {
    const lines: string[] = [];
    lines.push("# Password Strength Report");
    lines.push("");
    lines.push(`**Length:** ${result.length}`);
    lines.push(`**Score:** ${result.score}/100 (${result.label})`);
    lines.push(`**Estimated entropy:** ~${result.entropy} bits`);
    lines.push(`**Character classes:** ${[result.hasLower && "lowercase", result.hasUpper && "uppercase", result.hasDigit && "digits", result.hasSymbol && "symbols"].filter(Boolean).join(", ") || "none"}`);
    lines.push("");
    lines.push("## Weaknesses");
    for (const w of result.weaknesses) lines.push(`- ${w}`);
    lines.push("");
    lines.push("## Safer password guidance");
    for (const s of tips) lines.push(`- ${s}`);
    lines.push("");
    lines.push("---");
    lines.push("_Local analysis only. Password is never sent off your device or stored._");
    return lines.join("\n");
  }, [result, tips]);

  async function copy() {
    try { await navigator.clipboard.writeText(report); setCopied(true); } catch { setCopied(false); }
  }

  return (
    <ToolPageLayout
      title="Password Strength Checker"
      description="Score a password locally — strength, weaknesses, and safer guidance. Nothing is stored, sent over the network, or logged."
    >
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <MetaCard label="Skill demonstrated" body="Password entropy, common-password lists, secure UI patterns." accent="cyan" />
        <MetaCard label="Why it's useful" body="Quick coaching tool. Confirms a chosen password is strong before saving." accent="violet" />
        <MetaCard label="Privacy" body="100% client-side. The password never leaves your browser." accent="emerald" />
      </div>

      <div className="mb-6 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl">
        <label className="block text-xs text-white/60">
          <span className="block mb-1 font-medium text-white/70">Password (never stored)</span>
          <div className="flex gap-2">
            <input
              type={reveal ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Type or paste a password to evaluate"
              autoComplete="new-password"
              spellCheck={false}
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 font-mono"
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/30 transition-colors"
            >
              {reveal ? "Hide" : "Reveal"}
            </button>
            <button
              type="button"
              onClick={() => setPw("")}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/30 transition-colors"
            >
              Clear
            </button>
          </div>
          <span className="mt-2 block text-[11px] text-white/45">
            Analysis runs locally. Nothing is sent to any server.
          </span>
        </label>
      </div>

      <div className={`mb-6 rounded-2xl border bg-gradient-to-r p-5 ${toneClass[tone]}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">Strength</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-4xl font-bold">{result.score}</span>
          <span className="text-sm opacity-80">/100 · {result.label}</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-black/30 overflow-hidden">
          <div
            className="h-full bg-white/85 transition-all duration-300"
            style={{ width: `${Math.max(2, result.score)}%` }}
          />
        </div>
        <p className="mt-3 text-xs opacity-80">~{result.entropy} bits of estimated entropy at length {result.length}.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 mb-2">Weaknesses</p>
          <ul className="space-y-1.5 text-xs leading-6 text-white/75">
            {result.weaknesses.map((w) => <li key={w}>• {w}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 mb-2">Safer password guidance</p>
          <ul className="space-y-1.5 text-xs leading-6 text-white/75">
            {tips.map((t) => <li key={t}>• {t}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Report (Markdown)</p>
          <button
            onClick={copy}
            className="rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-400 transition-colors"
          >
            {copied ? "Copied!" : "Copy report"}
          </button>
        </div>
        <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/75 whitespace-pre-wrap">
{report}
        </pre>
      </div>
    </ToolPageLayout>
  );
}

function MetaCard({ label, body, accent }: { label: string; body: string; accent: "cyan" | "violet" | "emerald" }) {
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
