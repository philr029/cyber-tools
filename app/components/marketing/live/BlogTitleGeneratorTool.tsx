"use client";

import { useId, useState } from "react";
import MarketingToolLayout from "@/app/components/marketing/MarketingToolLayout";
import { generateBlogTitles } from "@/lib/marketing-tools/text-gen";

const field =
  "w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/25";
const label = "block text-sm font-medium text-white/75 mb-1.5";
const btnP = "rounded-xl bg-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60";
const btnS = "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";

export default function BlogTitleGeneratorTool() {
  const id = useId();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [count, setCount] = useState(8);
  const [lines, setLines] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  function run() {
    setMsg("");
    setLines(generateBlogTitles(topic, audience, tone, count));
  }

  function reset() {
    setTopic("");
    setAudience("");
    setTone("");
    setCount(8);
    setLines([]);
    setMsg("");
  }

  async function copy() {
    if (!lines.length) return;
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Ideas copied to clipboard.");
    } catch {
      setMsg("Copy failed — select the list and copy manually.");
    }
  }

  const toneOptions = ["Professional", "Friendly", "Bold", "Minimal", "Witty", "Educational"];

  return (
    <MarketingToolLayout
      title="Blog Title Generator"
      description="Turn a topic and audience into scroll-stopping headline ideas you can refine in your editor."
    >
      <div className="space-y-5">
        <div>
          <label className={label} htmlFor={`${id}-topic`}>
            Topic
          </label>
          <input id={`${id}-topic`} className={field} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. zero-party data for ecommerce" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor={`${id}-aud`}>
              Audience
            </label>
            <input id={`${id}-aud`} className={field} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. marketing directors" />
          </div>
          <div>
            <label className={label} htmlFor={`${id}-tone`}>
              Tone
            </label>
            <select id={`${id}-tone`} className={field} value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="">Let the tool pick</option>
              {toneOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={label} htmlFor={`${id}-n`}>
            Number of ideas
          </label>
          <input
            id={`${id}-n`}
            type="number"
            min={1}
            max={20}
            className={field}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnP} onClick={run}>
            Generate ideas
          </button>
          <button type="button" className={btnS} onClick={copy} disabled={!lines.length}>
            Copy ideas
          </button>
          <button type="button" className={btnS} onClick={reset}>
            Reset
          </button>
        </div>

        {lines.length > 0 ? (
          <ol className="list-decimal space-y-2 rounded-xl border border-white/10 bg-black/30 p-4 pl-8 text-sm leading-relaxed text-white/80">
            {lines.map((line, i) => (
              <li key={i} className="marker:text-cyan-400/90">
                {line}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-white/45">Generated titles appear here. Everything runs locally in your browser.</p>
        )}

        <p className="text-sm text-white/50" aria-live="polite">
          {msg}
        </p>
      </div>
    </MarketingToolLayout>
  );
}
