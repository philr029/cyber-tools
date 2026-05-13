/**
 * Helpers for storing UTF-8 strings in localStorage using passphrase-based AES-GCM
 * (see `client-crypto.ts`). Prefer the vault (`vault.ts`) + `mockData` integration for
 * lookup history when you want a single unlock per session.
 */

import { decryptUtf8WithPassphrase, encryptUtf8WithPassphrase } from "@/lib/security/client-crypto";

export async function encryptAndSave(storageKey: string, plaintext: string, passphrase: string): Promise<void> {
  if (typeof window === "undefined") return;
  const envelope = await encryptUtf8WithPassphrase(plaintext, passphrase);
  localStorage.setItem(storageKey, envelope);
}

export async function loadAndDecrypt(storageKey: string, passphrase: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return await decryptUtf8WithPassphrase(raw, passphrase);
  } catch {
    return null;
  }
}

export function clearSecureData(storageKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}
