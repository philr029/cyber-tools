"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

const COMMON = new Set([
  "password",
  "12345678",
  "qwerty123",
  "letmein",
  "welcome1",
  "admin123",
  "iloveyou",
  "passw0rd",
  "abc12345",
]);

interface Score {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Excellent";
  bits: number;
  reasons: string[];
}

function classify(pw: string): Score {
  const reasons: string[] = [];
  if (!pw) {
    return { score: 0, label: "Very weak", bits: 0, reasons: ["Enter a password to begin."] };
  }

  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^\w\s]/.test(pw)) pool += 32;
  if (/\s/.test(pw)) pool += 1;
  const bits = pool > 0 ? Math.round(pw.length * Math.log2(pool)) : 0;

  if (pw.length < 8) reasons.push("Length below 8 characters.");
  else if (pw.length < 12) reasons.push("Length is OK but 12+ is far stronger.");
  if (!/[A-Z]/.test(pw)) reasons.push("Add uppercase letters.");
  if (!/[a-z]/.test(pw)) reasons.push("Add lowercase letters.");
  if (!/\d/.test(pw)) reasons.push("Add a digit.");
  if (!/[^\w\s]/.test(pw)) reasons.push("Add a symbol or punctuation.");
  if (COMMON.has(pw.toLowerCase())) reasons.push("This is a common breached password — change it now.");
  if (/^(.)\1+$/.test(pw)) reasons.push("Avoid repeated characters.");
  if (/(.)\1\1/.test(pw)) reasons.push("Avoid 3 or more repeating characters in a row.");
  if (/(?:0123|1234|2345|3456|4567|5678|6789|7890)/.test(pw)) reasons.push("Avoid sequential digits.");
  if (/(?:abcd|qwer|asdf|zxcv|hjkl)/i.test(pw)) reasons.push("Avoid keyboard patterns.");

  let score: Score["score"] = 0;
  if (bits >= 90) score = 4;
  else if (bits >= 70) score = 3;
  else if (bits >= 50) score = 2;
  else if (bits >= 30) score = 1;
  else score = 0;

  if (COMMON.has(pw.toLowerCase())) score = 0;

  const labels: Score["label"][] = ["Very weak", "Weak", "Fair", "Strong", "Excellent"];
  return { score, label: labels[score], bits, reasons };
}

const SAMPLE_PASSPHRASE_WORDS = [
  "atlas",
  "candle",
  "winter",
  "harbour",
  "rocket",
  "violet",
  "kestrel",
  "lantern",
  "ember",
  "river",
];

function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("maxExclusive must be a positive integer");
  }

  const maxUint32 = 0x100000000;
  const limit = maxUint32 - (maxUint32 % maxExclusive);
  const buf = new Uint32Array(1);

  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);

  return value % maxExclusive;
}

function suggestPassphrase() {
  const a = SAMPLE_PASSPHRASE_WORDS[secureRandomInt(SAMPLE_PASSPHRASE_WORDS.length)];
  const b = SAMPLE_PASSPHRASE_WORDS[secureRandomInt(SAMPLE_PASSPHRASE_WORDS.length)];
  const c = SAMPLE_PASSPHRASE_WORDS[secureRandomInt(SAMPLE_PASSPHRASE_WORDS.length)];
  const n = secureRandomInt(90) + 10;
  return `${a}-${b}-${c}-${n}!`;
}

export default function PasswordAdvisorPage() {
  const [pw, setPw] = useState("");
  const [reveal, setReveal] = useState(false);
  const [passphrase, setPassphrase] = useState(() => suggestPassphrase());

  const result = useMemo(() => classify(pw), [pw]);

  const meter = ["bg-rose-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500", "bg-cyan-400"][result.score];
  const meterLabel = ["text-rose-300", "text-amber-300", "text-yellow-200", "text-emerald-300", "text-cyan-200"][result.score];

  return (
    <ToolPageLayout
      title="Password Strength Advisor"
      description="Type a candidate password and get a strength score, entropy estimate and specific improvement suggestions. Everything runs in your browser — your password is never transmitted."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Privacy" body="Runs entirely in the browser. Nothing is sent to a server." accent="cyan" />
        <Meta label="Why" body="Most account compromises start with a weak or reused password." accent="violet" />
        <Meta label="Best practice" body="Use a passphrase + password manager + MFA — three things together." accent="emerald" />
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <label className="block text-xs text-white/65">
          <span className="mb-1 block font-medium text-white/75">Password</span>
          <div className="flex gap-2">
            <input
              type={reveal ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
              spellCheck={false}
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              placeholder="Paste or type your candidate password here"
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              {reveal ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-white/65">
            <span>Strength</span>
            <span className={`font-semibold ${meterLabel}`}>
              {result.label} · {result.bits} bits
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-white/10">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${meter}`}
              style={{ width: `${(result.score / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Recommendations
            </p>
            <ul className="mt-2 space-y-1 text-xs text-white/75">
              {result.reasons.length === 0 ? (
                <li>No obvious issues — but always pair with MFA.</li>
              ) : (
                result.reasons.map((r) => <li key={r}>• {r}</li>)
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Try a passphrase instead
            </p>
            <p className="mt-2 break-all font-mono text-sm text-white">{passphrase}</p>
            <button
              type="button"
              onClick={() => setPassphrase(suggestPassphrase())}
              className="mt-2 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              Regenerate
            </button>
            <p className="mt-2 text-[11px] leading-5 text-cyan-100/75">
              Passphrases of 4+ random words beat shorter passwords on both memorability and entropy.
            </p>
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
