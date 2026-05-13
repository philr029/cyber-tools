/**
 * Browser-only cryptography using the Web Crypto API.
 *
 * SECURITY LIMITS (read before relying on this in production):
 * - This runs entirely in the browser. Anyone with physical access, malware, or XSS
 *   that can execute JS in your origin may be able to read data after decryption or
 *   intercept the passphrase when the user types it.
 * - This is NOT end-to-end encryption across servers, backups, or sync services.
 *   It is "client-side encryption at rest" for data you choose to store in
 *   localStorage (or similar) with a user passphrase.
 * - PBKDF2 iteration counts should be raised over time as hardware improves; bump
 *   `PBKDF2_ITERATIONS` and migrate old blobs if you change it.
 * - Never log passphrases, derived keys, or plaintext secrets.
 */

const PBKDF2_ITERATIONS = 210_000;
const AES_KEY_LENGTH = 256;
const GCM_IV_LENGTH = 12;
const SALT_LENGTH = 16;

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Derive an AES-GCM-256 key from a passphrase and salt using PBKDF2-SHA256.
 * The passphrase is never stored; keep the returned CryptoKey only in memory.
 */
export async function deriveAesGcmKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const saltCopy = new Uint8Array(salt.byteLength);
  saltCopy.set(salt);
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, [
    "deriveBits",
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltCopy as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function aesGcmEncryptUtf8(plaintext: string, key: CryptoKey): Promise<{ ivB64: string; ctB64: string }> {
  const iv = randomBytes(GCM_IV_LENGTH);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext),
  );
  return { ivB64: toBase64(iv), ctB64: toBase64(new Uint8Array(ciphertext)) };
}

export async function aesGcmDecryptUtf8(ivB64: string, ctB64: string, key: CryptoKey): Promise<string> {
  const iv = fromBase64(ivB64);
  const ct = fromBase64(ctB64);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ct as BufferSource,
  );
  return new TextDecoder().decode(plaintext);
}

/** One-shot encrypt: salt + IV unique per operation; store entire object next to ciphertext. */
export async function encryptUtf8WithPassphrase(plaintext: string, passphrase: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveAesGcmKeyFromPassphrase(passphrase, salt);
  const { ivB64, ctB64 } = await aesGcmEncryptUtf8(plaintext, key);
  return JSON.stringify({
    v: 1,
    algo: "AES-GCM-256+PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    saltB64: toBase64(salt),
    ivB64,
    ciphertextB64: ctB64,
  });
}

export async function decryptUtf8WithPassphrase(envelopeJson: string, passphrase: string): Promise<string> {
  const o = JSON.parse(envelopeJson) as {
    v: number;
    saltB64: string;
    ivB64: string;
    ciphertextB64: string;
  };
  if (o.v !== 1 || !o.saltB64 || !o.ivB64 || !o.ciphertextB64) {
    throw new Error("Unrecognised encryption envelope.");
  }
  const salt = fromBase64(o.saltB64);
  const key = await deriveAesGcmKeyFromPassphrase(passphrase, salt);
  return aesGcmDecryptUtf8(o.ivB64, o.ciphertextB64, key);
}

export { PBKDF2_ITERATIONS, SALT_LENGTH, GCM_IV_LENGTH };
