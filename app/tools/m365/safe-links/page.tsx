"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

const SAFE_LINKS_HOSTS = [
  "safelinks.protection.outlook.com",
  "eur02.safelinks.protection.outlook.com",
  "eur03.safelinks.protection.outlook.com",
  "nam01.safelinks.protection.outlook.com",
  "nam02.safelinks.protection.outlook.com",
  "nam04.safelinks.protection.outlook.com",
];

interface Decoded {
  isSafeLinks: boolean;
  original?: string;
  rewriter?: string;
  reason?: string;
  parameters?: Record<string, string>;
}

function decode(url: string): Decoded {
  try {
    const parsed = new URL(url.trim());
    const isSL = SAFE_LINKS_HOSTS.some((h) => parsed.hostname.toLowerCase().endsWith(h));
    if (!isSL) {
      return { isSafeLinks: false };
    }
    const original = parsed.searchParams.get("url") ?? undefined;
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((v, k) => {
      if (k !== "url") params[k] = v;
    });
    return {
      isSafeLinks: true,
      original: original ? decodeURIComponent(original) : undefined,
      rewriter: parsed.hostname,
      parameters: params,
    };
  } catch {
    return { isSafeLinks: false, reason: "Not a valid URL." };
  }
}

export default function SafeLinksPage() {
  const [url, setUrl] = useState(
    "https://eur02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Flogin&data=05%7C02&sdata=abc&reserved=0",
  );

  const decoded = useMemo(() => decode(url), [url]);

  const summary = useMemo(() => {
    if (!decoded.isSafeLinks) {
      return decoded.reason ?? "This does not look like a Microsoft Safe Links URL.";
    }
    const params =
      decoded.parameters && Object.keys(decoded.parameters).length > 0
        ? Object.entries(decoded.parameters)
            .map(([k, v]) => `  - ${k} = ${v}`)
            .join("\n")
        : "  - (none)";
    return [
      `# Safe Links analysis`,
      ``,
      `Rewriter host: ${decoded.rewriter}`,
      `Original URL:  ${decoded.original ?? "(missing 'url' parameter)"}`,
      ``,
      `Other tracking parameters:`,
      params,
      ``,
      `Notes:`,
      `- Microsoft Defender for Office 365 rewrites links in inbound mail to a Safe Links wrapper.`,
      `- Clicking the wrapper sends the click to Microsoft's reputation engine first.`,
      `- The wrapper does NOT mean the destination is safe — it means Microsoft will check it at click time.`,
      `- Always verify the *destination* domain matches what the user expects before clicking, especially for sign-in pages.`,
    ].join("\n");
  }, [decoded]);

  return (
    <ToolPageLayout
      title="Defender Safe Links Explainer"
      description="Paste a Microsoft Safe Links URL and see the actual destination, the rewriter region, and a short explanation of what the link actually does."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="Email security, user awareness." accent="cyan" />
        <Meta label="Why" body="End users see scary URLs daily and need a clear, fast explanation." accent="violet" />
        <Meta label="Privacy" body="URL is parsed locally — nothing leaves the browser." accent="emerald" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Safe Links URL</span>
            <textarea
              rows={6}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              spellCheck={false}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
          </label>

          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/85">
            <strong>Phishing reminder:</strong> Safe Links protection is not a substitute for verification.
            Always confirm the destination domain matches your expectation, especially before entering credentials.
            When in doubt, navigate manually and report the email via the Defender add-in.
          </div>
        </div>

        <div className="space-y-3">
          <div
            className={`rounded-[24px] border p-4 ${
              decoded.isSafeLinks
                ? "border-cyan-400/30 bg-cyan-500/10"
                : "border-amber-400/30 bg-amber-500/5"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Detection
            </p>
            <p className="mt-2 text-sm text-white">
              {decoded.isSafeLinks
                ? "This is a Microsoft Safe Links wrapper."
                : "This is not a Microsoft Safe Links URL."}
            </p>
            {decoded.isSafeLinks && decoded.original && (
              <p className="mt-2 text-xs leading-6 text-white/75 break-all">
                <strong>Destination:</strong> {decoded.original}
              </p>
            )}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Analysis (Markdown)
              </p>
              <CopyButton text={summary} label="Copy analysis" />
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre-wrap">
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
