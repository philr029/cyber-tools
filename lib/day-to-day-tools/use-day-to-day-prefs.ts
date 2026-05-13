"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const KEY_FAV = "ss_d2d_prefs_favourites";
const KEY_PIN = "ss_d2d_prefs_pinned";
const KEY_RECENT = "ss_d2d_prefs_recent";

const MAX_PINNED = 12;
const MAX_RECENT = 18;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function useDayToDayPrefs() {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [recent, setRecent] = useState<{ id: string; at: number }[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setFavourites(readJson<string[]>(KEY_FAV, []));
      setPinned(readJson<string[]>(KEY_PIN, []));
      setRecent(readJson<{ id: string; at: number }[]>(KEY_RECENT, []));
      setReady(true);
    });
  }, []);

  const persistFav = useCallback((next: string[]) => {
    setFavourites(next);
    writeJson(KEY_FAV, next);
  }, []);

  const persistPin = useCallback((next: string[]) => {
    setPinned(next);
    writeJson(KEY_PIN, next);
  }, []);

  const toggleFavourite = useCallback(
    (id: string) => {
      persistFav(favourites.includes(id) ? favourites.filter((x) => x !== id) : [...favourites, id]);
    },
    [favourites, persistFav],
  );

  const togglePinned = useCallback(
    (id: string) => {
      if (pinned.includes(id)) {
        persistPin(pinned.filter((x) => x !== id));
        return;
      }
      const next = [...pinned.filter((x) => x !== id), id];
      persistPin(next.slice(-MAX_PINNED));
    },
    [pinned, persistPin],
  );

  const recordOpened = useCallback((id: string) => {
    const at = Date.now();
    setRecent((prev) => {
      const rest = prev.filter((r) => r.id !== id);
      const next = [{ id, at }, ...rest].slice(0, MAX_RECENT);
      writeJson(KEY_RECENT, next);
      return next;
    });
  }, []);

  const favSet = useMemo(() => new Set(favourites), [favourites]);

  return {
    ready,
    favourites,
    favSet,
    pinned,
    recent,
    toggleFavourite,
    togglePinned,
    recordOpened,
  };
}
