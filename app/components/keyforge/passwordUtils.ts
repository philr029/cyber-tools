// Shared password generation utility used by PasswordGenerator and BulkGenerator

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*+-=?";
const AMBIGUOUS_SYMBOLS = "{}[]()/\\'\"`~,;:.<>";

const SIMILAR_CHARS = new Set(["O", "0", "l", "1", "I"]);

export function generatePassword(opts: PasswordOptions): string {
  let charset = "";

  if (opts.uppercase) charset += UPPERCASE;
  if (opts.lowercase) charset += LOWERCASE;
  if (opts.numbers) charset += NUMBERS;
  if (opts.symbols) charset += SYMBOLS + (opts.excludeAmbiguous ? "" : AMBIGUOUS_SYMBOLS);

  if (opts.excludeSimilar) {
    charset = charset.split("").filter((c) => !SIMILAR_CHARS.has(c)).join("");
  }

  if (!charset) return "";

  // Use crypto.getRandomValues for cryptographic randomness
  const array = new Uint32Array(opts.length);
  crypto.getRandomValues(array);

  let result = "";
  for (let i = 0; i < opts.length; i++) {
    result += charset[array[i] % charset.length];
  }

  // Ensure at least one character from each required set
  const required: string[] = [];
  if (opts.uppercase) {
    const pool = UPPERCASE.split("").filter((c) => !opts.excludeSimilar || !SIMILAR_CHARS.has(c)).join("");
    if (pool) required.push(pool[randomInt(pool.length)]);
  }
  if (opts.lowercase) {
    const pool = LOWERCASE.split("").filter((c) => !opts.excludeSimilar || !SIMILAR_CHARS.has(c)).join("");
    if (pool) required.push(pool[randomInt(pool.length)]);
  }
  if (opts.numbers) {
    const pool = NUMBERS.split("").filter((c) => !opts.excludeSimilar || !SIMILAR_CHARS.has(c)).join("");
    if (pool) required.push(pool[randomInt(pool.length)]);
  }
  if (opts.symbols) {
    const symPool = (SYMBOLS + (opts.excludeAmbiguous ? "" : AMBIGUOUS_SYMBOLS))
      .split("")
      .filter((c) => !opts.excludeSimilar || !SIMILAR_CHARS.has(c))
      .join("");
    if (symPool) required.push(symPool[randomInt(symPool.length)]);
  }

  // Scatter required characters into random positions
  const resultArr = result.split("");
  const positions = new Set<number>();
  while (positions.size < required.length && positions.size < resultArr.length) {
    positions.add(randomInt(resultArr.length));
  }
  const posArr = Array.from(positions);
  for (let i = 0; i < posArr.length; i++) {
    resultArr[posArr[i]] = required[i];
  }

  return resultArr.join("");
}

function randomInt(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}
