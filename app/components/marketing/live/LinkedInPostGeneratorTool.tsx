"use client";

import { useId, useState } from "react";
import MarketingToolLayout from "@/app/components/marketing/MarketingToolLayout";
import { generateLinkedInPost } from "@/lib/marketing-tools/text-gen";

const field =
  "w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/25";
const label = "block text-sm font-medium text-white/75 mb-1.5";
const btnP = "rounded-xl bg-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60";
const btnS = "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";

export default function LinkedInPostGeneratorTool() {
  const id = useId();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [goal, setGoal] = useState("");
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState("");

  function run() {
    setMsg("");
    setDraft(generateLinkedInPost(topic, audience, tone, goal));
  }

  function reset() {
    setTopic("");
    setAudience("");
    setTone("");
    setGoal("");
    setDraft("");
    setMsg("");
  }

  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setMsg("Post copied to clipboard.");
    } catch {
      setMsg("Copy failed — select the text and copy manually.");
    }
  }

  const goals = ["Drive comments", "Book discovery calls", "Share a lesson learned", "Promote a resource", "Build authority"];

  return (
    <MarketingToolLayout
      title="LinkedIn Post Generator"
      description="Draft a structured post with hook, body and CTA — tuned for professional tone on the feed."
    >
      <div className="space-y-5">
        <div>
          <label className={label} htmlFor={`${id}-topic`}>
            Topic
          </label>
          <input id={`${id}-topic`} className={field} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. why we sunset a profitable SKU" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor={`${id}-aud`}>
              Audience
            </label>
            <input id={`${id}-aud`} className={field} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. B2B founders" />
          </div>
          <div>
            <label className={label} htmlFor={`${id}-tone`}>
              Tone
            </label>
            <input id={`${id}-tone`} className={field} value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. candid, concise" />
          </div>
        </div>
        <div>
          <label className={label} htmlFor={`${id}-goal`}>
            Goal
          </label>
          <select id={`${id}-goal`} className={field} value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option value="">Balanced engagement</option>
            {goals.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnP} onClick={run}>
            Generate post
          </button>
          <button type="button" className={btnS} onClick={copy} disabled={!draft}>
            Copy post
          </button>
          <button type="button" className={btnS} onClick={reset}>
            Reset
          </button>
        </div>

        <div>
          <label className={label} htmlFor={`${id}-out`}>
            LinkedIn post draft
          </label>
          <textarea
            id={`${id}-out`}
            readOnly
            rows={12}
            className={`${field} min-h-[220px] resize-y font-sans leading-relaxed`}
            value={draft}
            placeholder="Your draft will appear here."
          />
        </div>

        <p className="text-sm text-white/50" aria-live="polite">
          {msg}
        </p>
      </div>
    </MarketingToolLayout>
  );
}
