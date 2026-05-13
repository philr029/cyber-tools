"use client";

import { renewCookiebotConsent } from "@/lib/cookiebot-consent";

type Props = {
  className?: string;
};

/**
 * Footer control — calls Cookiebot.renew() when the CMP is loaded.
 */
export default function CookieSettingsButton({ className }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => renewCookiebotConsent()}
    >
      Cookie Settings
    </button>
  );
}
