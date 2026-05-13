"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import PlatformModal from "@/components/messaging/PlatformModal";
import { useAuth } from "@/lib/auth-context";

const KEY = "ss_platform_welcome_modal_v1";

export default function FirstVisitWelcome() {
  const pathname = usePathname() ?? "/";
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => setOpen(true), 2600);
    return () => window.clearTimeout(t);
  }, [pathname, user, loading]);

  const close = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <PlatformModal
      open
      title="Welcome to SecureScope"
      description="A premium-style workspace for IT, marketing, cyber, and automation checks — with glass navigation, export-friendly forms, and a roadmap for real backends."
      onClose={close}
      closeOnBackdrop
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end w-full">
          <Link
            href="/docs"
            onClick={close}
            className="inline-flex justify-center rounded-xl border border-[var(--ss-border)] px-4 py-2.5 text-sm font-medium text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
          >
            Open docs
          </Link>
          <button
            type="button"
            onClick={close}
            className="inline-flex justify-center rounded-xl bg-[var(--ss-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Start exploring
          </button>
        </div>
      }
    >
      <ul className="list-disc pl-5 text-sm text-[var(--ss-text-secondary)] space-y-1.5">
        <li>Use the Tools menu for category shortcuts and your recently viewed routes.</li>
        <li>Forms save a local archive in this browser; optional server webhook via env vars.</li>
        <li>Pricing tiers are placeholders — no checkout is wired in this repository.</li>
      </ul>
    </PlatformModal>
  );
}
