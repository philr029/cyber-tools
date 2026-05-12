"use client";

import { useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

interface Source {
  name: string;
  description: string;
  apiDoc: string;
  note: string;
}

const SOURCES: Source[] = [
  {
    name: "DNSBL (Spamhaus, SORBS, etc.)",
    description: "DNS-based blocklists used by mail servers to reject spammy senders.",
    apiDoc: "https://www.spamhaus.org/zen/",
    note: "Free for non-commercial use. Use a serverless DNS query against zen.spamhaus.org.",
  },
  {
    name: "VirusTotal",
    description: "Aggregates 70+ antivirus engines and URL/domain reputation services.",
    apiDoc: "https://docs.virustotal.com/reference/domain-info",
    note: "Free tier limits ~4 req/min. Free quota is enough for portfolio demos.",
  },
  {
    name: "Google Safe Browsing",
    description: "Google's malware, phishing and unwanted-software list.",
    apiDoc: "https://developers.google.com/safe-browsing/v4",
    note: "API key required. Bind it to your serverless function only.",
  },
  {
    name: "HetrixTools Blacklist",
    description: "Real-time multi-RBL check (100+ DNS-based blacklists).",
    apiDoc: "https://docs.hetrixtools.com/blacklist-monitor/",
    note: "Token-based API. Wire via Netlify / Vercel functions, never expose token in JS.",
  },
];

export default function DomainReputationPage() {
  const [domain, setDomain] = useState("");
  return (
    <ToolPageLayout
      title="Domain Reputation Checker"
      description="Live API integration goes here. This is a frontend placeholder showing where each reputation source plugs in. API keys must live in your serverless function, not in the browser."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="Reputation engineering, secure API design." accent="cyan" />
        <Meta label="Why" body="Stops bad domains hitting your users — and proves you understand server-side secrets." accent="violet" />
        <Meta
          label="Future API"
          body="Wire each source to a serverless function (Vercel /api/* or Netlify /functions/*). The frontend POSTs a domain; the function holds API keys server-side and returns sanitised results."
          accent="emerald"
        />
      </div>

      <div className="rounded-[24px] border border-amber-400/30 bg-amber-500/5 p-4 text-xs leading-6 text-amber-100/85 mb-5">
        <strong>API keys cannot live in the frontend.</strong> If you deploy on GitHub Pages, push reputation checks to a serverless function on Vercel or Netlify that holds the keys server-side. The frontend just calls your function.
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <label className="block text-xs text-white/65">
          <span className="mb-1 block font-medium text-white/75">Domain</span>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <div key={s.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{s.name}</h3>
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Coming Soon API
                </span>
              </div>
              <p className="text-xs leading-5 text-white/70">{s.description}</p>
              <p className="mt-2 text-[11px] leading-5 text-white/45">
                Docs: <a className="text-cyan-300 hover:underline" href={s.apiDoc} target="_blank" rel="noopener noreferrer">{s.apiDoc}</a>
              </p>
              <p className="mt-1 text-[11px] leading-5 text-white/55">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/*
        SERVERLESS INTEGRATION NOTES
        ----------------------------
        Example Vercel: /api/domain-reputation.ts
          export default async function handler(req, res) {
            const { domain } = req.body;
            // 1. Validate domain (RFC 1035 form)
            // 2. Call providers in parallel:
            //    - DNSBL via DNS lookup against domain.zen.spamhaus.org
            //    - VirusTotal: fetch with process.env.VT_API_KEY
            //    - Google Safe Browsing: process.env.GSB_API_KEY
            //    - HetrixTools: process.env.HETRIX_TOKEN
            // 3. Aggregate and return a normalised verdict.
            // 4. Cache for ~5 min with CDN to stay under free tiers.
          }
        Example Netlify: netlify/functions/domain-reputation.ts (same shape).
        Do NOT add the API keys to the repo; configure them in the project's
        dashboard.
      */}
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
