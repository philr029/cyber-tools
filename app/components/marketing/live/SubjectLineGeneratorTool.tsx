"use client";

import { useId, useState } from "react";
import MarketingToolLayout from "@/app/components/marketing/MarketingToolLayout";
import { generateSubjectLines } from "@/lib/marketing-tools/text-gen";

const field =
  "w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/25";
const label = "block text-sm font-medium text-white/75 mb-1.5";
const btnP = "rounded-xl bg-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60";
const btnS = "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";

export default function SubjectLineGeneratorTool() {
  const id = useId();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [offer, setOffer] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  function run() {
    setMsg("");
    setLines(generateSubjectLines(topic, audience, tone, offer));
  }

  function reset() {
    setTopic("");
    setAudience("");
    setTone("");
    setOffer("");
    setLines([]);
    setMsg("");
  }

  async function copy() {
    if (!lines.length) return;
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Subject lines copied.");
    } catch {
      setMsg("Copy failed — select the list and copy manually.");
    }
  }

  const toneOptions = ["Urgent", "Calm", "Curious", "Direct", "Premium", "Playful"];

  return (
    <MarketingToolLayout
      title="Subject Line Generator"
      description="Produce ten distinct angles for your next send — tuned to topic, audience and offer."
    >
      <div className="space-y-5">
        <div>
          <label className={label} htmlFor={`${id}-topic`}>
            Email topic
          </label>
          <input id={`${id}-topic`} className={field} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. May product recap" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor={`${id}-aud`}>
              Audience
            </label>
            <input id={`${id}-aud`} className={field} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. trial users" />
          </div>
          <div>
            <label className={label} htmlFor={`${id}-tone`}>
              Tone
            </label>
            <select id={`${id}-tone`} className={field} value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="">Balanced</option>
              {toneOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={label} htmlFor={`${id}-off`}>
            Offer or CTA
          </label>
          <input id={`${id}-off`} className={field} value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. 20% off annual plans" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnP} onClick={run}>
            Generate subject lines
          </button>
          <button type="button" className={btnS} onClick={copy} disabled={!lines.length}>
            Copy
          </button>
          <button type="button" className={btnS} onClick={reset}>
            Reset
          </button>
        </div>

        {lines.length > 0 ? (
          <ol className="list-decimal space-y-2 rounded-xl border border-white/10 bg-black/30 p-4 pl-8 text-sm leading-relaxed text-white/85">
            {lines.map((line, i) => (
              <li key={i} className="marker:text-cyan-400/90">
                {line}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-white/45">Ten subject lines will appear here. Runs locally in your browser.</p>
        )}

        <p className="text-sm text-white/50" aria-live="polite">
          {msg}
        </p>
      </div>
    </MarketingToolLayout>
  );
}
