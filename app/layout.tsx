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
  metadataBase: new URL("https://philr029.github.io/cyber-tools"),
  title: {
    default: "SecureScope | IT, Cybersecurity & Automation Portfolio",
    template: "%s | SecureScope",
  },
  description:
    "Professional cybersecurity and IT portfolio featuring threat intelligence tools, Microsoft 365 administration capabilities, automation projects, and full-stack development work.",
  keywords: [
    "cybersecurity portfolio",
    "IT admin",
    "Microsoft 365",
    "security automation",
    "threat intelligence",
    "Next.js security tools",
  ],
  authors: [{ name: "Philip Ruttley" }],
  creator: "Philip Ruttley",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SecureScope | IT, Cybersecurity & Automation Portfolio",
    description:
      "Explore featured cybersecurity projects, automation tools, Microsoft 365 admin skills, and modern web engineering demos.",
    url: "/",
    siteName: "SecureScope",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureScope | IT, Cybersecurity & Automation Portfolio",
    description:
      "Interview-ready cybersecurity portfolio: tools, automation, Microsoft 365 administration, and full-stack demos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#050505] antialiased">
        <AuthProvider>
          <ToastProvider>
            <WorkspaceProvider>
              <NotificationsProvider>
                <ThemeProvider>
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-cyan-600 focus:text-white"
                  >
                    Skip to main content
                  </a>
                  <Header />
                  <div id="main-content" tabIndex={-1} className="flex-1 flex flex-col">
                    {children}
                  </div>
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
