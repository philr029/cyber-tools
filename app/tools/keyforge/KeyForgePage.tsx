"use client";

import Link from "next/link";
import PasswordGenerator from "@/app/components/keyforge/PasswordGenerator";
import PassphraseGenerator from "@/app/components/keyforge/PassphraseGenerator";
import BulkGenerator from "@/app/components/keyforge/BulkGenerator";
import SecurityNotice from "@/app/components/keyforge/SecurityNotice";

const BackIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

export default function KeyForgePage() {
  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            {BackIcon}
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-800">KeyForge</span>
        </div>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M8 7a5 5 0 114.546 4.978l-.285.286a.75.75 0 01-.531.22H11v.75a.75.75 0 01-.75.75H9.5v.75a.75.75 0 01-.75.75h-2A.75.75 0 016 15v-1.879a.75.75 0 01.22-.53l2.502-2.502A5.003 5.003 0 018 7zm5-1a1 1 0 11-2 0 1 1 0 012 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">KeyForge</h1>
              <p className="text-sm text-gray-500">Strong passwords &amp; passphrases, generated in your browser</p>
            </div>
          </div>
        </div>

        {/* Security notice at top */}
        <div className="mb-8">
          <SecurityNotice />
        </div>

        {/* Two-column grid: password + passphrase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PasswordGenerator />
          <PassphraseGenerator />
        </div>

        {/* Bulk generator full-width */}
        <div className="mb-8">
          <BulkGenerator />
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400">
          KeyForge uses{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Web Crypto API
          </a>{" "}
          for cryptographically secure random generation.
        </p>
      </div>
    </main>
  );
}
