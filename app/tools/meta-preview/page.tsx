"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

export default function MetaPreviewPage() {
  const [title, setTitle] = useState("SecureScope — IT & Cyber Toolkit");
  const [description, setDescription] = useState(
    "An interactive portfolio of IT, security, Microsoft 365 and automation tools — built with Next.js and Tailwind.",
  );
  const [url, setUrl] = useState("https://example.com/tools");

  const titleLen = title.length;
  const descLen = description.length;
  const titleWarn = titleLen > 60;
  const descWarn = descLen > 160;

  const html = useMemo(() => `<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${escapeHtml(url)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />`, [title, description, url]);

  async function copy() { try { await navigator.clipboard.writeText(html); } catch {} }

  return (
    <ToolPageLayout
      title="Meta Title & Description Preview"
      description="Live preview of how your page title, description and Open Graph metadata will render in Google search results and on social cards."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label={`Page title (${titleLen}/60)`} value={title} onChange={setTitle} warn={titleWarn} />
          <Field label={`Meta description (${descLen}/160)`} value={description} onChange={setDescription} warn={descWarn} multi />
          <Field label="Canonical URL" value={url} onChange={setUrl} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45 mb-3">Google SERP preview</p>
            <div className="rounded-xl bg-white p-4 text-black shadow-inner">
              <div className="text-[12px] text-[#202124]">{url}</div>
              <div className="text-[18px] leading-snug text-[#1a0dab]">{truncate(title, 60)}</div>
              <div className="mt-1 text-[13px] leading-snug text-[#4d5156]">{truncate(description, 160)}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45 mb-3">Social (Twitter / X) preview</p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-black">
              <div className="h-32 rounded-md bg-gradient-to-br from-cyan-100 to-blue-200 mb-2 flex items-center justify-center text-cyan-700 font-semibold">og:image goes here</div>
              <div className="text-[12px] uppercase tracking-wide text-slate-500">{new URL(url || "https://example.com").host}</div>
              <div className="text-sm font-semibold text-slate-900">{truncate(title, 70)}</div>
              <div className="text-xs text-slate-600">{truncate(description, 200)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">HTML snippet</p>
          <button onClick={copy} className="rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-400">Copy snippet</button>
        </div>
        <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 font-mono whitespace-pre-wrap">{html}</pre>
      </div>
    </ToolPageLayout>
  );
}

function Field({ label, value, onChange, warn, multi }: { label: string; value: string; onChange: (v: string) => void; warn?: boolean; multi?: boolean }) {
  const cls = `w-full rounded-xl border bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
    warn ? "border-amber-400/50" : "border-white/10"
  }`;
  return (
    <label className="block">
      <span className={`block text-xs font-medium mb-1 ${warn ? "text-amber-300" : "text-white/70"}`}>{label}</span>
      {multi ? (
        <textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
function escapeHtml(s: string) { return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;"); }
