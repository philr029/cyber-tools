import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import Header from "@/app/components/Header";
import ChatWidget from "@/components/ai/ChatWidget";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { ThemeProvider } from "@/lib/theme-context";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
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

  return (
    <html lang="en" className={`h-full ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--ss-page)] text-[var(--ss-text)] antialiased">
        <AuthProvider>
          <ToastProvider>
            <WorkspaceProvider>
              <NotificationsProvider>
                <ThemeProvider>
                  <Header />
                  <main id="main-content" className="flex flex-1 flex-col">
                    {children}
                  </main>
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
