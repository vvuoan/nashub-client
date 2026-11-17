import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_MS = 180_000;

/** 3 分钟无操作进入屏保；覆盖层打开时不进入。 */
export function useIdleSaver(blocked: boolean) {
  const [saverOn, setSaverOn] = useState(false);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;
  const timer = useRef<number | null>(null);

  const resetIdle = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (!blockedRef.current && !document.hidden) setSaverOn(true);
    }, IDLE_MS);
  }, []);

  useEffect(() => {
    resetIdle();
    const onVisible = () => {
      if (!document.hidden) resetIdle();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [resetIdle]);

  const exitSaver = useCallback(() => {
    setSaverOn(false);
    resetIdle();
  }, [resetIdle]);

  return { saverOn, exitSaver, resetIdle };
}
