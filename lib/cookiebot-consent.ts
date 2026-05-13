"use client";

declare global {
  interface Window {
    Cookiebot?: {
      renew: () => void;
      consent?: {
        necessary?: boolean;
        preferences?: boolean;
        statistics?: boolean;
        marketing?: boolean;
      };
      runScripts?: () => void;
    };
  }
}

/**
 * Reopens the Cookiebot consent dialog (e.g. from “Cookie Settings” in the footer).
 * Safe if the CMP script has not finished loading yet.
 */
export function renewCookiebotConsent(): void {
  if (typeof window === "undefined") return;
  try {
    const cb = window.Cookiebot;
    if (cb && typeof cb.renew === "function") {
      cb.renew();
      return;
    }
    const cc = (window as Window & { CookieConsent?: { renew?: () => void } }).CookieConsent;
    if (cc && typeof cc.renew === "function") {
      cc.renew();
      return;
    }
  } catch {
    // ignore
  }
  if (process.env.NODE_ENV === "development") {
    globalThis.console?.info?.(
      "[Cookiebot] renew() unavailable — script may still be loading. Retry after the banner appears, or check NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID.",
    );
  }
}

export function readStatisticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.Cookiebot?.consent?.statistics);
  } catch {
    return false;
  }
}

export function readMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.Cookiebot?.consent?.marketing);
  } catch {
    return false;
  }
}
