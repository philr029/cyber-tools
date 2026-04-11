"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "ss_daily_scans";
export const FREE_DAILY_LIMIT = 10;

interface DailyRecord {
  date: string; // "YYYY-MM-DD"
  count: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function readRecord(): DailyRecord {
  if (typeof window === "undefined") return { date: todayStr(), count: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayStr(), count: 0 };
    const parsed = JSON.parse(raw) as DailyRecord;
    // Reset if it's a new day
    if (parsed.date !== todayStr()) return { date: todayStr(), count: 0 };
    return parsed;
  } catch {
    return { date: todayStr(), count: 0 };
  }
}

function writeRecord(record: DailyRecord): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore storage errors
  }
}

/**
 * Hook for tracking and enforcing the daily free-tier scan limit.
 *
 * Returns:
 *   scansToday  – how many scans the user has already run today
 *   canScan     – whether another scan is allowed (always true for pro users)
 *   increment   – call this after a successful scan
 */
export function useDailyScans(plan: "free" | "pro" | null) {
  // Lazy init reads from localStorage on the client; returns 0 during SSR
  const [scansToday, setScansToday] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return readRecord().count;
  });

  const canScan = plan === "pro" || scansToday < FREE_DAILY_LIMIT;

  const increment = useCallback(() => {
    const rec = readRecord();
    const next = { date: todayStr(), count: rec.count + 1 };
    writeRecord(next);
    setScansToday(next.count);
  }, []);

  return { scansToday, canScan, increment };
}
