"use client";

import type { ReactNode } from "react";
import SectionReveal from "@/app/components/ui/SectionReveal";

/** Scroll-triggered fade-up wrapper — thin alias over `SectionReveal` for layout semantics. */
export default function AnimatedSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <SectionReveal className={className}>{children}</SectionReveal>;
}
