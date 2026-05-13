"use client";

import { useCallback, useEffect, useState } from "react";
import { readMarketingConsent } from "@/lib/cookiebot-consent";

/** Re-renders when Cookiebot marketing consent changes (for gating newsletter popups). */
export function useMarketingConsent(): boolean {
  const [ok, setOk] = useState(false);

  const sync = useCallback(() => {
    setOk(readMarketingConsent());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("CookiebotOnConsentReady", sync);
    window.addEventListener("CookiebotOnAccept", sync);
    window.addEventListener("CookiebotOnDecline", sync);
    return () => {
      window.removeEventListener("CookiebotOnConsentReady", sync);
      window.removeEventListener("CookiebotOnAccept", sync);
      window.removeEventListener("CookiebotOnDecline", sync);
    };
  }, [sync]);

  return ok;
}
