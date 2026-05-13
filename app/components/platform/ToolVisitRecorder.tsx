"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordToolPageView } from "@/lib/platform/tool-nav-memory";

/** Records lightweight “recent tool” entries for mega menu + stats. */
export default function ToolVisitRecorder() {
  const pathname = usePathname() ?? "/";
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;
    const title = typeof document !== "undefined" ? document.title.replace(/\s*[—–-]\s*SecureScope.*$/i, "").trim() : "";
    recordToolPageView(pathname, title || undefined);
  }, [pathname]);

  return null;
}
