"use client";

import { useEffect, useState } from "react";

/** Shows ⌘K on macOS and Ctrl+K elsewhere — avoids Apple-only assumptions in UI copy. */
export default function SearchHotkeyText({ className = "" }: { className?: string }) {
  const [mac, setMac] = useState<boolean | null>(null);
  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    setMac(/Macintosh|Mac OS X|iPhone|iPad|iPod/i.test(ua));
  }, []);
  if (mac === null) {
    return <span className={className}>Ctrl+K</span>;
  }
  return <span className={className}>{mac ? "⌘K" : "Ctrl+K"}</span>;
}
