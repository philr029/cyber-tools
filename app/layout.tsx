import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import Header from "@/app/components/Header";
import ChatWidget from "@/components/ai/ChatWidget";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "SecureScope – Enterprise Security Platform",
  description:
    "Enterprise-grade cyber intelligence platform. Monitor assets, manage cases, automate workflows, and respond to threats.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <html lang="en" className={`h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col bg-[#050505] antialiased">
        <AuthProvider>
          <ToastProvider>
            <WorkspaceProvider>
              <NotificationsProvider>
                <ThemeProvider>
                  <Header />
                  <main id="main-content" className="flex-1 flex flex-col motion-safe:animate-page-enter">
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
