"use client";

import { useLayoutEffect } from "react";
import { COOKIEBOT_DOMAIN_GROUP_ID } from "@/lib/cookiebot-config";

const SCRIPT_ID = "Cookiebot";

/**
 * Injects Cookiebot after the client tree hydrates so React never has to reconcile
 * a `<script>` that Next/Cookiebot mutates (avoids hydration mismatches vs `next/script`).
 */
export function CookiebotHeadScript({ nonce }: { nonce?: string }) {
  useLayoutEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "text/javascript";
    script.src = "https://consent.cookiebot.com/uc.js";
    script.setAttribute("data-cbid", COOKIEBOT_DOMAIN_GROUP_ID);
    script.setAttribute("data-blockingmode", "auto");
    if (nonce) script.setAttribute("nonce", nonce);

    const head = document.head;
    const first = head.firstChild;
    if (first) head.insertBefore(script, first);
    else head.appendChild(script);
  }, [nonce]);

  return null;
}
