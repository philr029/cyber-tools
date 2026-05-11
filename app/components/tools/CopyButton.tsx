"use client";

import { useEffect, useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function CopyButton({
  text,
  label = "Copy",
  className = "",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } catch {
        /* noop */
      }
      ta.remove();
    }
  }

  const sizing =
    size === "md"
      ? "px-3.5 py-2 text-xs"
      : "px-3 py-1.5 text-[11px]";

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!text}
      aria-label={copied ? "Copied to clipboard" : label}
      className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${sizing} ${
        copied
          ? "bg-emerald-500/90 text-white"
          : "bg-cyan-500/90 text-white hover:bg-cyan-400"
      } ${className}`}
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
              clipRule="evenodd"
            />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M7 3a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2H7z" />
            <path d="M3 7a2 2 0 012-2v8a4 4 0 004 4h6a2 2 0 01-2 2H7a4 4 0 01-4-4V7z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
