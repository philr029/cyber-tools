/**
 * In-memory user store for demo purposes.
 * In production, replace with a real database (e.g. Prisma + Postgres).
 */

import { pbkdf2Sync, randomBytes } from "crypto";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: "free" | "pro";
  createdAt: Date;
  scanCount: number;
}

// ---------------------------------------------------------------------------
// Password helpers — PBKDF2-SHA256 with 200,000 iterations
// (use bcrypt/argon2 in production for better memory-hardness)
// ---------------------------------------------------------------------------

const PBKDF2_ITERATIONS = 200_000;
const PBKDF2_KEY_LEN = 64;
const PBKDF2_DIGEST = "sha256";

export function createPasswordHash(password: string): string {
  const salt = randomBytes(32).toString("hex");
  const hash = pbkdf2Sync(
    password,
    salt + (process.env.PASSWORD_PEPPER ?? "ss-pepper"),
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LEN,
    PBKDF2_DIGEST,
  ).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) return false;
  const hash = pbkdf2Sync(
    password,
    salt + (process.env.PASSWORD_PEPPER ?? "ss-pepper"),
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LEN,
    PBKDF2_DIGEST,
  ).toString("hex");
  // Constant-time comparison to prevent timing attacks
  if (hash.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const USERS = new Map<string, User>();

// Seed demo accounts
function seedDemoUsers(): void {
  const demo1: User = {
    id: "demo-user-1",
    email: "demo@securescope.io",
    name: "Demo User",
    passwordHash: createPasswordHash("demo1234"),
    plan: "pro",
    createdAt: new Date("2024-01-01"),
    scanCount: 42,
  };
  const demo2: User = {
    id: "demo-user-2",
    email: "analyst@securescope.io",
    name: "SOC Analyst",
    passwordHash: createPasswordHash("analyst123"),
    plan: "free",
    createdAt: new Date("2024-03-15"),
    scanCount: 7,
  };
  USERS.set(demo1.email, demo1);
  USERS.set(demo2.email, demo2);
}
seedDemoUsers();

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function getUserByEmail(email: string): User | undefined {
  return USERS.get(email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  for (const user of USERS.values()) {
    if (user.id === id) return user;
  }
  return undefined;
}

export function createUser(
  email: string,
  name: string,
  password: string,
): User {
  const id = `user-${randomBytes(8).toString("hex")}`;
  const user: User = {
    id,
    email: email.toLowerCase(),
    name,
    passwordHash: createPasswordHash(password),
    plan: "free",
    createdAt: new Date(),
    scanCount: 0,
  };
  USERS.set(user.email, user);
  return user;
}

export function incrementScanCount(userId: string): void {
  for (const user of USERS.values()) {
    if (user.id === userId) {
      user.scanCount += 1;
      break;
    }
  }
}

export const FREE_PLAN_DAILY_LIMIT = 10;
