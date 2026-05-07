"use client";

import { useState } from "react";
import {
  sanitizeMultilineInput,
  sanitizeSingleLineInput,
} from "@/lib/input-sanitization";

interface AISummaryPanelProps {
  context: string;
  toolName: string;
}

const SparkIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.949 5.684z" />
  </svg>
);

export default function AISummaryPanel({ context, toolName }: AISummaryPanelProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleSummarise() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    setExpanded(true);

    const safeToolName = sanitizeSingleLineInput(toolName, { maxLength: 120 });
    const safeContext = sanitizeMultilineInput(context, { maxLength: 6000 });
    const prompt = `You are a cybersecurity analyst. A user ran the "${safeToolName}" tool and got the following result:\n\n${safeContext}\n\nIn 3–5 short bullet points, explain:\n1. What the key findings mean in plain language\n2. The risk level and why\n3. What action (if any) the user should take\n\nBe direct and concise. Use "•" for bullets.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, history: [] }),
      });
      const json = await res.json();
      if ("reply" in json) {
        setSummary(json.reply as string);
      } else {
        setError("Could not generate summary.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={handleSummarise}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/20 hover:border-purple-500/40 transition-all"
      >
        {SparkIcon}
        Explain with AI
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-purple-500/5 border border-purple-500/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/10">
        <div className="flex items-center gap-2 text-purple-300 text-sm font-medium">
          {SparkIcon}
          AI Summary
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
        >
          Dismiss
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin flex-shrink-0" />
            Analysing results…
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {summary && (
          <div className="text-sm text-slate-300 space-y-1 whitespace-pre-line leading-relaxed">
            {summary}
          </div>
        )}
        {!loading && !error && !summary && (
          <button
            type="button"
            onClick={handleSummarise}
            className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
          >
            Generate summary
          </button>
        )}
      </div>
    </div>
  );
}
