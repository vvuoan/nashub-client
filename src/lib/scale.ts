import { useEffect, useState } from "react";
import type { ScreenProfile } from "../types";

export function computeScale(cssW: number, cssH: number): number {
  return Math.max(0.25, Math.min(cssW / 1920, cssH / 1080));
}

export function readProfile(): ScreenProfile {
  const cssW = window.innerWidth;
  const cssH = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  return {
    cssW,
    cssH,
    dpr,
    physW: Math.round(cssW * dpr),
    physH: Math.round(cssH * dpr),
    u: computeScale(cssW, cssH),
    mbps: 0,
  };
}

/** 把 --u 写成 px，CSS 里所有 calc(n * var(--u)) 沿用旧主页逻辑。 */
export function useScreenProfile(): ScreenProfile {
  const [profile, setProfile] = useState<ScreenProfile>(readProfile);

  useEffect(() => {
    const apply = () => {
      const next = readProfile();
      document.documentElement.style.setProperty("--u", `${next.u}px`);
      setProfile(next);
    };
    apply();
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("resize", apply);
    };
  }, []);

  return profile;
}
