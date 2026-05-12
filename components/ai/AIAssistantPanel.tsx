"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentScanResult } from "@/lib/ai-agents/agentTypes";
import { sanitizeMultilineInput } from "@/lib/input-sanitization";
import type { ChatMessage } from "@/types/chat";
import { buildScanContext } from "@/lib/core/stateManager";
import { withBasePath } from "@/lib/base-path";

// ---------------------------------------------------------------------------
// Suggested prompts required by Phase 4
// ---------------------------------------------------------------------------

interface SuggestedPrompt {
  label: string;
  /** User-visible text sent as the message */
  message: string;
  /** Key used to choose the rule-based fallback */
  key: "explain" | "safe" | "next" | "summary";
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    label: "Explain this result",
    message: "Can you explain what this scan result means?",
    key: "explain",
  },
  {
    label: "Is this safe?",
    message: "Based on this scan, is this target safe to trust?",
    key: "safe",
  },
  {
    label: "What should I do next?",
    message: "What actions should I take based on these findings?",
    key: "next",
  },
  {
    label: "Summarise for a non-technical user",
    message: "Can you explain this scan result in simple, non-technical language?",
    key: "summary",
  },
];

// ---------------------------------------------------------------------------
// Rule-based fallback responses (used when Gemini is not configured)
// ---------------------------------------------------------------------------

function getRuleBasedResponse(key: SuggestedPrompt["key"], result: AgentScanResult): string {
  const { query, risk, explanation, actions, analysis } = result;
  const criticals = analysis.anomalies.filter((a) => a.severity === "critical");
  const warnings  = analysis.anomalies.filter((a) => a.severity === "warning");

  switch (key) {
    case "explain": {
      const bullets = explanation.technicalDetails
        .slice(0, 5)
        .map((d) => `• ${d}`)
        .join("\n");
      return [
        `**Scan result for \`${query}\`**`,
        "",
        explanation.summary,
        "",
        "**Key technical findings:**",
        bullets || "• No significant technical findings.",
        "",
        criticals.length > 0
          ? `**Critical issues (${criticals.length}):** ${criticals.map((c) => c.description).join("; ")}`
          : "",
        warnings.length > 0
          ? `**Warnings (${warnings.length}):** ${warnings.map((w) => w.description).join("; ")}`
          : "",
      ]
        .filter((l) => l !== "")
        .join("\n");
    }

    case "safe": {
      const isClean = risk.level === "Safe" || risk.level === "Low";
      const isMedium = risk.level === "Medium";
      let verdict: string;
      if (isClean) {
        verdict = `**${query}** appears to be safe. The risk score is ${risk.score}/100 (${risk.level}), with no critical issues found.`;
      } else if (isMedium) {
        verdict = `**${query}** shows some concerns. The risk score is ${risk.score}/100 (${risk.level}). Exercise caution and review the findings before trusting this target.`;
      } else {
        verdict = `**${query}** poses significant risk. The risk score is ${risk.score}/100 (${risk.level}). The recommended verdict is **${actions.verdict.toUpperCase()}**.`;
      }
      return [
        verdict,
        "",
        `**Reasoning:** ${actions.verdictReason}`,
        criticals.length > 0
          ? `\n**${criticals.length} critical issue(s) detected:** ${criticals.map((c) => c.description).join("; ")}`
          : "",
      ]
        .filter((l) => l !== "")
        .join("\n");
    }

    case "next": {
      const top = actions.actions.slice(0, 4);
      const steps = top.length > 0
        ? top
            .map(
              (a, i) =>
                `${i + 1}. **${a.action}** *(${a.priority} priority)*\n   ${a.detail}`
            )
            .join("\n\n")
        : "No specific actions recommended — continue monitoring.";
      const improvements = actions.securityImprovements.slice(0, 3);
      return [
        `**Recommended next steps for \`${query}\`:**`,
        "",
        steps,
        improvements.length > 0
          ? `\n**Security hardening suggestions:**\n${improvements.map((s) => `• ${s}`).join("\n")}`
          : "",
      ]
        .filter((l) => l !== "")
        .join("\n");
    }

    case "summary": {
      return [
        `**Plain-English summary for \`${query}\`:**`,
        "",
        explanation.plainEnglish,
        "",
        `**Overall verdict:** ${actions.verdict.toUpperCase()} — ${actions.verdictReason}`,
      ].join("\n");
    }
  }
}

function getFreeformFallback(userMessage: string, result: AgentScanResult): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("explain") || lower.includes("what") || lower.includes("mean")) {
    return getRuleBasedResponse("explain", result);
  }
  if (lower.includes("safe") || lower.includes("trust") || lower.includes("risk")) {
    return getRuleBasedResponse("safe", result);
  }
  if (lower.includes("next") || lower.includes("do") || lower.includes("action") || lower.includes("recommend")) {
    return getRuleBasedResponse("next", result);
  }
  if (lower.includes("simple") || lower.includes("non-technical") || lower.includes("summarise") || lower.includes("summarize")) {
    return getRuleBasedResponse("summary", result);
  }
  return `Based on the scan of **${result.query}** (Risk: ${result.risk.level}, Score: ${result.risk.score}/100):\n\n${result.explanation.summary}\n\nVerdict: **${result.actions.verdict.toUpperCase()}** — ${result.actions.verdictReason}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingDots() {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center mr-2 mt-0.5">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="bg-[#1e2d4a] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  // Render basic markdown-like bold (**text**) and bullets
  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      // Bold: **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i} className="block leading-relaxed">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold text-slate-100">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </span>
      );
    });
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center mr-2 mt-0.5">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm break-words ${
          isUser
            ? "bg-cyan-600 text-white rounded-br-sm"
            : "bg-[#1e2d4a] text-slate-300 rounded-bl-sm"
        }`}
      >
        {isUser ? message.content : renderContent(message.content)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

interface AIAssistantPanelProps {
  result: AgentScanResult;
}

export default function AIAssistantPanel({ result }: AIAssistantPanelProps) {
  const welcomeMsg = useCallback((): ChatMessage => ({
    id: "welcome",
    role: "assistant",
    content: `I've reviewed the scan for **${result.query}** — Risk: ${result.risk.level} (${result.risk.score}/100), Verdict: ${result.actions.verdict.toUpperCase()}. Ask me anything about these findings, or choose a prompt below.`,
    timestamp: Date.now(),
  }), [result]);

  const [messages, setMessages]           = useState<ChatMessage[]>(() => [welcomeMsg()]);
  const [input, setInput]                 = useState("");
  const [isLoading, setIsLoading]         = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef                    = useRef<HTMLDivElement>(null);
  const inputRef                          = useRef<HTMLTextAreaElement>(null);

  // Re-initialise when the result changes (new scan)
  useEffect(() => {
    setMessages([welcomeMsg()]);
    setInput("");
    setIsLoading(false);
    setShowSuggestions(true);
  }, [result.logEntry.id, welcomeMsg]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (textOverride?: string, promptKey?: SuggestedPrompt["key"]) => {
      const text = sanitizeMultilineInput(textOverride ?? input, { maxLength: 4000 });
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setShowSuggestions(false);

      // Build conversation history excluding the welcome message
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const scanContext = buildScanContext(result);
      const messageWithContext = scanContext
        ? `[SCAN CONTEXT]\n${scanContext}\n\n[USER QUESTION]\n${text}`
        : text;

      try {
        const res = await fetch(withBasePath("/api/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageWithContext, history }),
        });

        if (res.status === 503 || res.status === 502) {
          // AI not configured — use rule-based fallback
          const fallback = promptKey
            ? getRuleBasedResponse(promptKey, result)
            : getFreeformFallback(text, result);
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "assistant", content: fallback, timestamp: Date.now() },
          ]);
        } else {
          const data = await res.json();
          const content =
            "reply" in data
              ? (data.reply as string)
              : "Sorry, I couldn't get a response right now.";
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "assistant", content, timestamp: Date.now() },
          ]);
        }
      } catch {
        const fallback = promptKey
          ? getRuleBasedResponse(promptKey, result)
          : getFreeformFallback(text, result);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: fallback, timestamp: Date.now() },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, result]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([welcomeMsg()]);
    setInput("");
    setShowSuggestions(true);
  };

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e2d4a]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">AI Security Assistant</p>
            <p className="text-[11px] text-slate-500 leading-tight">
              Analysing <span className="font-mono text-cyan-400">{result.query}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearChat}
          title="Clear conversation"
          className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#1e2d4a] flex items-center justify-center transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-0"
        style={{ maxHeight: "320px", minHeight: "160px" }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingDots />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {showSuggestions && messages.length <= 1 && !isLoading && (
        <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt.key}
              type="button"
              onClick={() => sendMessage(prompt.message, prompt.key)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1e2d4a] hover:bg-[#263855] text-cyan-300 text-[11px] font-medium border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[#1e2d4a]">
        <div className="flex items-end gap-2 bg-[#131929] rounded-xl border border-[#1e2d4a] px-3 py-2 focus-within:border-cyan-500/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this scan result…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none min-h-[20px] max-h-[100px] leading-5 disabled:opacity-50"
            style={{ overflowY: input.split("\n").length > 4 ? "auto" : "hidden" }}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
