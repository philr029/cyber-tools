import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import Link from "next/link";
import { connection } from "next/server";
import { COOKIEBOT_DOMAIN_GROUP_ID, isCookiebotConfigured } from "@/lib/cookiebot-config";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Cookie Policy – SecureScope",
  description: "Cookie declaration and consent preferences for SecureScope.",
};

export default async function CookiePolicyPage() {
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const configured = isCookiebotConfigured();
  /** Path segment is the raw Domain Group ID (UUID-style; no extra encoding required). */
  const declarationSrc = `https://consent.cookiebot.com/${COOKIEBOT_DOMAIN_GROUP_ID}/cd.js`;

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">Cookie Policy</h1>
      <p className="text-sm text-slate-400 mt-3 leading-relaxed">
        This page embeds your Cookiebot cookie declaration. Consent is stored by Cookiebot; we classify our own
        scripts as described in the repository README and SECURITY.md.
      </p>

      {!configured ? (
        <div
          role="status"
          className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
        >
          <p className="font-medium text-amber-50">Cookiebot is not configured yet</p>
          <p className="mt-2 text-amber-100/90">
            Set <code className="text-amber-200/90">NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID</code> in{" "}
            <code className="text-amber-200/90">.env.local</code> (see <code className="text-amber-200/90">.env.example</code>
            ) with your real Domain Group ID from the Cookiebot dashboard. The declaration embed loads below once
            configured.
          </p>
        </div>
      ) : (
        <>
          {/*
            Cookiebot cookie declaration — Domain Group ID comes from NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID
            (same value as data-cbid on the main CMP script in app/layout.tsx).
          */}
          <Script
            id="CookieDeclaration"
            src={declarationSrc}
            strategy="afterInteractive"
            async
            nonce={nonce}
            data-cookieconsent="necessary"
          />
        </>
      )}

      <p className="text-sm text-slate-500 mt-10">
        <Link href={withBasePath("/")} className="text-cyan-400 hover:text-cyan-300 font-medium">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
