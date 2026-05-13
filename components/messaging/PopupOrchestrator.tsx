"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import PlatformModal from "@/components/messaging/PlatformModal";
import PlatformForm from "@/components/messaging/PlatformForm";
import { useMarketingConsent } from "@/components/messaging/use-marketing-consent";
import { POPUPS } from "@/lib/messaging/popups.config";
import type { PopupConfig } from "@/lib/messaging/types";
import {
  setDismissed,
  shouldShowDismissible,
  setPopupLastShown,
  getPopupLastShown,
} from "@/lib/messaging/dismiss-storage";
import { matchesAuth, matchesPathPrefixes } from "@/lib/messaging/path-match";
import { useAuth } from "@/lib/auth-context";
import { withBasePath } from "@/lib/base-path";

function isEligible(
  p: PopupConfig,
  pathname: string,
  isLoggedIn: boolean,
  marketingOk: boolean,
): boolean {
  if (!p.enabled) return false;
  if (p.requiresMarketingConsent && !marketingOk) return false;
  if (!matchesPathPrefixes(pathname, p.pathPrefixes)) return false;
  if (!matchesAuth(p.auth, isLoggedIn)) return false;
  if (!shouldShowDismissible("popup", p.id, p.version, p.dismissTtlDays)) return false;
  const last = getPopupLastShown(p.id);
  const min = p.minIntervalMs ?? 0;
  if (last != null && min > 0 && Date.now() - last < min) return false;
  return true;
}

export default function PopupOrchestrator() {
  const pathname = usePathname() ?? "/";
  const { user, loading } = useAuth();
  const isLoggedIn = Boolean(user);
  const marketingOk = useMarketingConsent();
  const [active, setActive] = useState<PopupConfig | null>(null);
  const firedForPath = useRef(false);
  const activeRef = useRef<PopupConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  activeRef.current = active;

  const dismiss = useCallback((p: PopupConfig) => {
    setDismissed("popup", p.id, p.version);
    setPopupLastShown(p.id);
    setActive(null);
  }, []);

  useEffect(() => {
    const prev = activeRef.current;
    if (prev) setPopupLastShown(prev.id);
    setActive(null);
    firedForPath.current = false;
  }, [pathname]);

  useEffect(() => {
    if (loading || firedForPath.current) return;
    const pick = POPUPS.find((p) => isEligible(p, pathname, isLoggedIn, marketingOk));
    if (!pick) return;

    const delay = pick.delayMs ?? 4000;
    timerRef.current = setTimeout(() => {
      firedForPath.current = true;
      setActive(pick);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, isLoggedIn, loading, marketingOk]);

  if (!active) return null;

  const ctaHref = active.ctaLink ? withBasePath(active.ctaLink) : null;
  const onClose = () => dismiss(active);

  if (active.kind === "newsletter") {
    return (
      <PlatformModal
        open
        title={active.title}
        description={active.message}
        onClose={onClose}
        closeOnBackdrop={false}
        footer={
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-[var(--ss-border)] px-4 py-2.5 text-sm font-medium text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] sm:w-auto"
          >
            Maybe later
          </button>
        }
      >
        <PlatformForm
          formId="newsletter"
          compact
          onSuccess={() => {
            window.setTimeout(() => dismiss(active), 2800);
          }}
        />
      </PlatformModal>
    );
  }

  if (active.kind === "whats-new") {
    return (
      <PlatformModal
        open
        title={active.title}
        description={active.message}
        onClose={onClose}
        closeOnBackdrop
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {ctaHref && active.ctaText ? (
              <Link
                href={ctaHref}
                className="inline-flex justify-center rounded-xl border border-[var(--ss-border)] px-4 py-2.5 text-sm font-medium text-[var(--ss-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
              >
                {active.ctaText}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-xl bg-[var(--ss-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
            >
              Got it
            </button>
          </div>
        }
      />
    );
  }

  return (
    <PlatformModal
      open
      title={active.title}
      description={active.message}
      onClose={onClose}
      closeOnBackdrop={active.kind !== "security-warning"}
      tone={active.kind === "security-warning" ? "security" : "default"}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {ctaHref && active.ctaText ? (
            <Link
              href={ctaHref}
              className="inline-flex justify-center rounded-xl bg-[var(--ss-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
            >
              {active.ctaText}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-xl border border-[var(--ss-border)] px-4 py-2.5 text-sm font-medium text-[var(--ss-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
          >
            Close
          </button>
        </div>
      }
    />
  );
}
