"use client";

import { useCallback, useEffect, useState } from "react";
import { hydrateHistory, loadHistory } from "@/lib/mockData";
import type { HistoryEntry } from "@/lib/types";

/**
 * Scan history that respects optional client-side encryption (see `/security`).
 * Plaintext history hydrates synchronously; encrypted blobs load after vault unlock.
 */
export function useHydratedHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    typeof window === "undefined" ? [] : loadHistory(),
  );

  const refresh = useCallback(() => {
    void hydrateHistory().then(setHistory);
  }, []);

  useEffect(() => {
    void hydrateHistory().then(setHistory);
    const onVault = () => {
      void hydrateHistory().then(setHistory);
    };
    window.addEventListener("ss-vault-changed", onVault);
    return () => window.removeEventListener("ss-vault-changed", onVault);
  }, []);

  return { history, setHistory, refreshHistory: refresh };
}
