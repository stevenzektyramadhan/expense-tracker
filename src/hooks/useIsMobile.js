"use client";

/**
 * @deprecated Phase 9: no active route selects a full page tree by viewport.
 * Responsive layout now uses CSS, with focused presentation variants receiving
 * shared data and callbacks. Retained until cleanup is explicitly approved.
 */
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const update = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    setIsReady(true);

    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return { isMobile, isReady };
}
