// src/hooks/useLockBodyScroll.ts
import { useLayoutEffect } from "react";
import { acquireBodyLock, releaseBodyLock } from "../utils/scroll/lock";

export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;
    acquireBodyLock();
    return () => releaseBodyLock();
  }, [locked]);
}
