"use client";

import { useEffect, useRef } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/**
 * Loads optional Google Analytics (gtag) only after Cookiebot **statistics** consent.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID when you add a GA4 property; leave unset to skip.
 */
export default function ConsentAwareAnalytics() {
  const injected = useRef(false);

  useEffect(() => {
    const measurementId = GA_ID;
    if (!measurementId || measurementId === "G-XXXXXXXXXX") return;
    const gaMeasurementId: string = measurementId;

    function tryInject() {
      if (injected.current) return;
      const w = window as Window & { Cookiebot?: { consent?: { statistics?: boolean } }; gtag?: (...args: unknown[]) => void };
      if (!w.Cookiebot?.consent?.statistics) return;
      injected.current = true;

      const s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.dataset.cookieconsent = "statistics";
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
      document.head.appendChild(s);

      const win = window as unknown as Window & { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void };
      win.dataLayer = win.dataLayer || [];
      function gtag(...args: unknown[]) {
        win.dataLayer.push(args);
      }
      win.gtag = gtag;
      gtag("js", new Date());
      gtag("config", gaMeasurementId, { anonymize_ip: true });
    }

    function onConsentChange() {
      tryInject();
    }

    window.addEventListener("CookiebotOnConsentReady", onConsentChange);
    window.addEventListener("CookiebotOnAccept", onConsentChange);
    window.addEventListener("CookiebotOnDecline", onConsentChange);

    tryInject();

    return () => {
      window.removeEventListener("CookiebotOnConsentReady", onConsentChange);
      window.removeEventListener("CookiebotOnAccept", onConsentChange);
      window.removeEventListener("CookiebotOnDecline", onConsentChange);
    };
  }, []);

  return null;
}
