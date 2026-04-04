import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import ChatWidget from "@/components/ai/ChatWidget";

export const metadata: Metadata = {
  title: "SecureScope – Cyber Intelligence Dashboard",
  description:
    "Monitor IP reputation, domain security, SSL certificates, blacklist status, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 antialiased">
        <Header />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
