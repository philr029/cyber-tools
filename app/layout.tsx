import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import ChatWidget from "@/components/ai/ChatWidget";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "SecureScope – Enterprise Security Platform",
  description:
    "Enterprise-grade cyber intelligence platform. Monitor assets, manage cases, automate workflows, and respond to threats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0b0f1a] antialiased">
        <AuthProvider>
          <ToastProvider>
            <WorkspaceProvider>
              <NotificationsProvider>
                <ThemeProvider>
                  <Header />
                  {children}
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
