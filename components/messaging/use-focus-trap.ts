"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(active: boolean, rootRef: RefObject<HTMLElement | null>) {
  const prevActive = useRef(false);

  useEffect(() => {
    if (!active) {
      prevActive.current = false;
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const first = () => focusables()[0];
    const last = () => focusables()[focusables().length - 1];

    if (!prevActive.current) {
      queueMicrotask(() => first()?.focus());
    }
    prevActive.current = true;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl?.focus();
      }
    }

    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("keydown", onKeyDown);
    };
  }, [active, rootRef]);
}
