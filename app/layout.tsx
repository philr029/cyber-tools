import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { connection } from "next/server";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/app/components/Header";
import SiteFooter from "@/app/components/SiteFooter";
import ChatWidget from "@/components/ai/ChatWidget";
import { CookiebotHeadScript } from "@/components/consent/CookiebotHeadScript";
import ConsentAwareAnalytics from "@/components/consent/ConsentAwareAnalytics";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { ThemeProvider } from "@/lib/theme-context";
import { getAppBasePath } from "@/lib/base-path";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

function siteMetadataBase(): URL | undefined {
  const basePath = getAppBasePath();
  const custom = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelHost = process.env.VERCEL_URL?.trim();

  let origin: URL | null = null;
  if (custom) {
    try {
      origin = new URL(custom.includes("://") ? custom : `https://${custom}`);
    } catch {
      origin = null;
    }
  } else if (vercelHost) {
    try {
      origin = new URL(`https://${vercelHost}`);
    } catch {
      origin = null;
    }
  }
  if (!origin) return undefined;
  if (!basePath) return origin;
  try {
    return new URL(`${basePath}/`, origin);
  } catch {
    return origin;
  }
}

export const metadata: Metadata = {
  metadataBase: siteMetadataBase(),
  title: "SecureScope – IT & Security Automation Hub",
  description:
    "A polished toolkit for IT admins, security analysts, and marketers: domain intelligence, web QA, automation planners, and monitoring — in one fast workspace.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="en" className={`h-full ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--ss-page)] text-[var(--ss-text)] antialiased">
        {/*
          Cookiebot loads via `CookiebotHeadScript` (client) so the CMP script is not part of the SSR
          React tree — avoids hydration mismatches from Next/Cookiebot rewriting `<script>` nodes.
          Domain Group ID: NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID (see lib/cookiebot-config.ts).
        */}
        <CookiebotHeadScript nonce={nonce || undefined} />
        <AuthProvider>
          <ToastProvider>
            <WorkspaceProvider>
              <NotificationsProvider>
                <ThemeProvider>
                  <Header />
                  <main id="main-content" className="flex flex-1 flex-col">
                    {children}
                  </main>
                  <SiteFooter />
                  <ConsentAwareAnalytics />
                  <ChatWidget />
                </ThemeProvider>
              </NotificationsProvider>
            </WorkspaceProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
