"use client";

import { useId, useState } from "react";
import MarketingToolLayout from "@/app/components/marketing/MarketingToolLayout";
import { buildUtmUrl } from "@/lib/marketing-tools/utm-build";

const field =
  "w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/25";
const label = "block text-sm font-medium text-white/75 mb-1.5";
const btnP = "rounded-xl bg-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60";
const btnS = "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";

export default function UtmBuilderTool() {
  const baseId = useId();
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [copyMsg, setCopyMsg] = useState("");

  function generate() {
    setCopyMsg("");
    const res = buildUtmUrl(url, {
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_term: term,
      utm_content: content,
    });
    if (!res.ok) {
      setErr(res.error);
      setOut("");
      return;
    }
    setErr("");
    setOut(res.url);
  }

  function reset() {
    setUrl("");
    setSource("");
    setMedium("");
    setCampaign("");
    setTerm("");
    setContent("");
    setOut("");
    setErr("");
    setCopyMsg("");
  }

  async function copy() {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
      setCopyMsg("Copied to clipboard.");
    } catch {
      setCopyMsg("Copy failed — select the URL and copy manually.");
    }
  }

  return (
    <MarketingToolLayout
      title="UTM Builder"
      description="Compose tagged URLs so campaign traffic stays attributable in Google Analytics and other tools."
    >
      <div className="space-y-5">
        <div>
          <label className={label} htmlFor={`${baseId}-url`}>
            Website URL
          </label>
          <input
            id={`${baseId}-url`}
            className={field}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/pricing"
            inputMode="url"
            autoComplete="url"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor={`${baseId}-src`}>
              Campaign source
            </label>
            <input id={`${baseId}-src`} className={field} value={source} onChange={(e) => setSource(e.target.value)} placeholder="newsletter" />
          </div>
          <div>
            <label className={label} htmlFor={`${baseId}-med`}>
              Campaign medium
            </label>
            <input id={`${baseId}-med`} className={field} value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="email" />
          </div>
          <div>
            <label className={label} htmlFor={`${baseId}-camp`}>
              Campaign name
            </label>
            <input id={`${baseId}-camp`} className={field} value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="spring_launch" />
          </div>
          <div>
            <label className={label} htmlFor={`${baseId}-term`}>
              Campaign term <span className="font-normal text-white/40">(optional)</span>
            </label>
            <input id={`${baseId}-term`} className={field} value={term} onChange={(e) => setTerm(e.target.value)} placeholder="brand+kw" />
          </div>
        </div>
        <div>
          <label className={label} htmlFor={`${baseId}-content`}>
            Campaign content <span className="font-normal text-white/40">(optional)</span>
          </label>
          <input id={`${baseId}-content`} className={field} value={content} onChange={(e) => setContent(e.target.value)} placeholder="hero_cta_v2" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnP} onClick={generate}>
            Generate URL
          </button>
          <button type="button" className={btnS} onClick={copy} disabled={!out}>
            Copy URL
          </button>
          <button type="button" className={btnS} onClick={reset}>
            Reset
          </button>
        </div>

        {err ? (
          <p className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100" role="alert">
            {err}
          </p>
        ) : null}

        {out ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">Final UTM URL</p>
            <output className="mt-2 block break-all rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs leading-relaxed text-cyan-100 sm:text-sm">
              {out}
            </output>
          </div>
        ) : null}

        <p className="text-sm text-white/50" aria-live="polite">
          {copyMsg}
        </p>
      </div>
    </MarketingToolLayout>
  );
}
