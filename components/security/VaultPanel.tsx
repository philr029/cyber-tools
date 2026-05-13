"use client";

import { useCallback, useEffect, useState } from "react";
import {
  enableVaultAndMigrate,
  isVaultSaltConfigured,
  isVaultUnlocked,
  lockVault,
  unlockVault,
} from "@/lib/security/vault";

/**
 * Client-side encrypted history vault (Web Crypto). Requires a signed-in session
 * to reach the host page — the passphrase still never leaves memory intact.
 */
export default function VaultPanel() {
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [saltConfigured, setSaltConfigured] = useState(false);
  const [enablePass, setEnablePass] = useState("");
  const [unlockPass, setUnlockPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshVaultUi = useCallback(() => {
    setVaultUnlocked(isVaultUnlocked());
    setSaltConfigured(isVaultSaltConfigured());
  }, []);

  useEffect(() => {
    refreshVaultUi();
    const onVault = () => refreshVaultUi();
    window.addEventListener("ss-vault-changed", onVault);
    return () => window.removeEventListener("ss-vault-changed", onVault);
  }, [refreshVaultUi]);

  async function onEnable(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const res = await enableVaultAndMigrate(enablePass);
      setMessage(res.ok ? "Encrypted history enabled. Your passphrase is not stored — keep it safe." : res.message);
      if (res.ok) setEnablePass("");
    } finally {
      setBusy(false);
    }
  }

  async function onUnlock(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const res = await unlockVault(unlockPass);
      setMessage(res.ok ? "Vault unlocked for this browser tab session." : res.message);
      if (res.ok) setUnlockPass("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#1e2d4a] bg-[#0c1222]/80 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Encrypted scan history (client-side)</h2>
      <p className="text-sm text-slate-400 leading-relaxed">
        When enabled, scan history in <code className="text-cyan-200/90 text-xs">localStorage</code> is stored as
        AES-GCM ciphertext with a random IV and a PBKDF2 salt. Your passphrase is never written to disk. After a full
        reload you must unlock again. This is not full-site E2EE — see the public Security checklist for limits.
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span
          className={`rounded-full px-2.5 py-1 border ${
            saltConfigured ? "border-emerald-500/30 text-emerald-300" : "border-slate-600 text-slate-400"
          }`}
        >
          Salt: {saltConfigured ? "configured" : "not set"}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 border ${
            vaultUnlocked ? "border-emerald-500/30 text-emerald-300" : "border-slate-600 text-slate-400"
          }`}
        >
          Session key: {vaultUnlocked ? "unlocked" : "locked"}
        </span>
      </div>
      {message ? (
        <p className="text-xs rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2 text-slate-300">{message}</p>
      ) : null}
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={onEnable} className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200">First-time: enable encryption</h3>
          <label className="block text-xs text-slate-500">
            Passphrase
            <input
              type="password"
              autoComplete="new-password"
              value={enablePass}
              onChange={(e) => setEnablePass(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#1e2d4a] bg-[#131929] px-3 py-2 text-sm text-slate-200"
              placeholder="Choose a strong passphrase"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !enablePass}
            className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm py-2 font-medium"
          >
            Enable encrypted history
          </button>
        </form>
        <form onSubmit={onUnlock} className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200">Unlock this session</h3>
          <label className="block text-xs text-slate-500">
            Passphrase
            <input
              type="password"
              autoComplete="current-password"
              value={unlockPass}
              onChange={(e) => setUnlockPass(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#1e2d4a] bg-[#131929] px-3 py-2 text-sm text-slate-200"
              placeholder="Enter passphrase"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !unlockPass}
            className="w-full rounded-lg border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50 text-sm py-2 font-medium"
          >
            Unlock vault
          </button>
        </form>
      </div>
      <button
        type="button"
        onClick={() => {
          lockVault();
          setMessage("Vault locked. Encrypted blobs remain on device; history is unreadable until you unlock.");
        }}
        className="text-xs text-slate-500 hover:text-slate-300 underline"
      >
        Lock vault (clear key from memory)
      </button>
    </section>
  );
}
