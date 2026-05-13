/**
 * In-memory vault for client-side AES-GCM with a single PBKDF2-derived key per session.
 * The passphrase is never persisted. The PBKDF2 salt is stored in localStorage so the
 * same passphrase can unlock the same vault across reloads (you must re-enter the
 * passphrase after each full page load — only the salt persists, not the key).
 */

import {
  aesGcmDecryptUtf8,
  aesGcmEncryptUtf8,
  deriveAesGcmKeyFromPassphrase,
  randomBytes,
} from "@/lib/security/client-crypto";

const VAULT_SALT_KEY = "ss_vault_pbkdf2_salt";

export const HISTORY_ENCRYPTED_MARKER = "__ssEnc" as const;

export type VaultEnvelope = {
  [HISTORY_ENCRYPTED_MARKER]: true;
  ivB64: string;
  ciphertextB64: string;
};

let sessionAesKey: CryptoKey | null = null;

function getVaultSalt(): Uint8Array | null {
  if (typeof window === "undefined") return null;
  const b64 = localStorage.getItem(VAULT_SALT_KEY);
  if (!b64) return null;
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function setVaultSalt(salt: Uint8Array): void {
  let bin = "";
  for (let i = 0; i < salt.length; i++) bin += String.fromCharCode(salt[i]);
  localStorage.setItem(VAULT_SALT_KEY, btoa(bin));
}

/** True after the user has completed “Enable encrypted history” (PBKDF2 salt persisted). */
export function isVaultSaltConfigured(): boolean {
  return getVaultSalt() !== null;
}

export function isVaultUnlocked(): boolean {
  return sessionAesKey !== null;
}

export function lockVault(): void {
  sessionAesKey = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ss-vault-changed"));
  }
}

/**
 * Unlock vault: derives AES key from passphrase + persisted salt.
 * If encrypted history exists, verifies passphrase by attempting decrypt.
 */
export async function unlockVault(passphrase: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (typeof window === "undefined") return { ok: false, message: "Vault is only available in the browser." };
  const salt = getVaultSalt();
  if (!salt) {
    return {
      ok: false,
      message: "Encrypted history is not configured yet. Use “Enable encrypted history” on the Security page first.",
    };
  }
  try {
    const key = await deriveAesGcmKeyFromPassphrase(passphrase, salt);
    const probe = typeof localStorage !== "undefined" ? localStorage.getItem("securescope_history") : null;
    if (probe && isEncryptedEnvelopeString(probe)) {
      const env = JSON.parse(probe) as VaultEnvelope;
      await aesGcmDecryptUtf8(env.ivB64, env.ciphertextB64, key);
    }
    sessionAesKey = key;
    window.dispatchEvent(new Event("ss-vault-changed"));
    return { ok: true };
  } catch {
    return { ok: false, message: "Incorrect passphrase or corrupted vault data." };
  }
}

/**
 * First-time setup: create salt, derive key, encrypt current plaintext history (if any).
 */
export async function enableVaultAndMigrate(passphrase: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (typeof window === "undefined") return { ok: false, message: "Vault is only available in the browser." };
  if (getVaultSalt()) {
    return { ok: false, message: "Encrypted storage is already initialised. Use Unlock instead." };
  }
  const salt = randomBytes(16);
  setVaultSalt(salt);
  try {
    const key = await deriveAesGcmKeyFromPassphrase(passphrase, salt);
    sessionAesKey = key;
    const { migratePlainHistoryToEncrypted } = await import("@/lib/mockData");
    await migratePlainHistoryToEncrypted();
    window.dispatchEvent(new Event("ss-vault-changed"));
    return { ok: true };
  } catch (e) {
    sessionAesKey = null;
    localStorage.removeItem(VAULT_SALT_KEY);
    const msg = e instanceof Error ? e.message : "Migration failed.";
    return { ok: false, message: msg };
  }
}

export function isEncryptedEnvelopeString(raw: string): boolean {
  try {
    const o = JSON.parse(raw) as Partial<VaultEnvelope>;
    return o[HISTORY_ENCRYPTED_MARKER] === true && typeof o.ivB64 === "string" && typeof o.ciphertextB64 === "string";
  } catch {
    return false;
  }
}

export async function encryptEnvelope(plaintextUtf8: string): Promise<string> {
  if (!sessionAesKey) throw new Error("Vault is locked.");
  const { ivB64, ctB64 } = await aesGcmEncryptUtf8(plaintextUtf8, sessionAesKey);
  const envelope: VaultEnvelope = {
    [HISTORY_ENCRYPTED_MARKER]: true,
    ivB64,
    ciphertextB64: ctB64,
  };
  return JSON.stringify(envelope);
}

export async function decryptEnvelopeString(raw: string): Promise<string> {
  if (!sessionAesKey) throw new Error("Vault is locked.");
  const env = JSON.parse(raw) as VaultEnvelope;
  return aesGcmDecryptUtf8(env.ivB64, env.ciphertextB64, sessionAesKey);
}
