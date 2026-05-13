"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import PlatformModal from "@/components/messaging/PlatformModal";
import { withBasePath } from "@/lib/base-path";

type LoginPromptOptions = {
  title?: string;
  message?: string;
  returnTo?: string;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  closeOnBackdrop?: boolean;
  tone?: "default" | "security";
};

type ConfirmInternal = ConfirmOptions & { resolve: (v: boolean) => void };

interface PlatformModalsValue {
  openLoginPrompt: (opts?: LoginPromptOptions) => void;
  closeLoginPrompt: () => void;
  /** Resolves true if user confirmed, false if cancelled or closed. */
  openConfirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const PlatformModalsContext = createContext<PlatformModalsValue | null>(null);

export function PlatformModalProvider({ children }: { children: ReactNode }) {
  const [login, setLogin] = useState<LoginPromptOptions | null>(null);
  const [confirm, setConfirm] = useState<ConfirmInternal | null>(null);

  const openLoginPrompt = useCallback((opts?: LoginPromptOptions) => {
    setLogin(opts ?? {});
  }, []);

  const closeLoginPrompt = useCallback(() => setLogin(null), []);

  const openConfirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirm({ ...opts, resolve });
    });
  }, []);

  const value = useMemo(
    () => ({ openLoginPrompt, closeLoginPrompt, openConfirm }),
    [openLoginPrompt, closeLoginPrompt, openConfirm],
  );

  const loginHref = useMemo(() => {
    const r = login?.returnTo?.trim();
    if (r && r.startsWith("/") && !r.startsWith("//")) {
      return withBasePath(`/login?redirect=${encodeURIComponent(r)}`);
    }
    return withBasePath("/login");
  }, [login?.returnTo]);

  return (
    <PlatformModalsContext.Provider value={value}>
      {children}
      <PlatformModal
        open={Boolean(login)}
        title={login?.title ?? "Sign in required"}
        description={
          login?.message ??
          "Create a free account or sign in to use this part of the workspace. API keys and quotas stay server-side."
        }
        onClose={closeLoginPrompt}
        closeOnBackdrop
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeLoginPrompt}
              className="inline-flex justify-center rounded-xl border border-[var(--ss-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--ss-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
            >
              Not now
            </button>
            <Link
              href={loginHref}
              className="inline-flex justify-center rounded-xl bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_color-mix(in_srgb,var(--ss-accent)_28%,transparent)] transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
            >
              Continue to sign in
            </Link>
          </div>
        }
      />

      <PlatformModal
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        description={confirm?.message}
        onClose={() => {
          confirm?.resolve(false);
          setConfirm(null);
        }}
        closeOnBackdrop={confirm?.closeOnBackdrop ?? false}
        tone={confirm?.tone}
        footer={
          confirm ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  confirm.resolve(false);
                  setConfirm(null);
                }}
                className="inline-flex justify-center rounded-xl border border-[var(--ss-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--ss-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
              >
                {confirm.cancelText ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirm.resolve(true);
                  setConfirm(null);
                }}
                className="inline-flex justify-center rounded-xl bg-[var(--ss-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
              >
                {confirm.confirmText ?? "Confirm"}
              </button>
            </div>
          ) : null
        }
      />
    </PlatformModalsContext.Provider>
  );
}

export function usePlatformModals(): PlatformModalsValue {
  const ctx = useContext(PlatformModalsContext);
  if (!ctx) {
    throw new Error("usePlatformModals must be used within PlatformModalProvider");
  }
  return ctx;
}
