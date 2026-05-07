"use client";

import { useCallback, useRef, useState } from "react";

export type ActivityLevel = "info" | "success" | "warning" | "error";

export interface ActivityEntry {
  id: string;
  level: ActivityLevel;
  message: string;
  timestamp: string;
}

const MAX_ENTRIES = 8;

function normalizeEntry(id: string, level: ActivityLevel, message: string): ActivityEntry {
  return {
    id,
    level,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function useActivityConsole(
  initialEntries: Array<{ level: ActivityLevel; message: string }> = [],
) {
  const counterRef = useRef(0);
  const [entries, setEntries] = useState<ActivityEntry[]>(() => {
    return initialEntries
      .map((entry) => normalizeEntry(`activity-${counterRef.current++}`, entry.level, entry.message))
      .reverse();
  });

  const log = useCallback((level: ActivityLevel, message: string) => {
    setEntries((current) => [
      normalizeEntry(`activity-${counterRef.current++}`, level, message),
      ...current,
    ].slice(0, MAX_ENTRIES));
  }, []);

  return { entries, log };
}
