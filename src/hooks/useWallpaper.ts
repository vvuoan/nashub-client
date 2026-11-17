import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HomeData, WallSource } from "../types";

interface Persisted {
  src: WallSource;
  idx: number;
  manual: boolean;
}

const KEY = "ntv.wall";
const RECENT_ROTATE_MS = 10 * 60_000;

function readPref(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    const src = parsed.src;
    if (src === "recent" || src === "black") {
      return {
        src,
        idx: Number.isFinite(parsed.idx) ? Number(parsed.idx) : 0,
        manual: Boolean(parsed.manual),
      };
    }
  } catch {
    // 忽略损坏的本地偏好
  }
  return null;
}

function luminance(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 18;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, 32, 18);
        const pixels = ctx.getImageData(0, 0, 32, 18).data;
        let total = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          total += (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
        }
        resolve(total / (pixels.length / 4));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * 壁纸只认后端返回的剧照地址（data.stills）。没有数据时只剩「纯黑」，
 * 不保留任何本地图片兜底。
 */
export function useWallpaper(data: HomeData, paused: boolean) {
  const initial = useRef(readPref());
  const [source, setSource] = useState<WallSource>(initial.current?.src ?? "recent");
  const [idx, setIdx] = useState(initial.current?.idx ?? 0);
  const [manual, setManual] = useState(initial.current?.manual ?? false);
  const [wallUrl, setWallUrl] = useState<string | null>(null);
  const [dim, setDim] = useState(0.38);

  const hasStills = data.stills.length > 0;
  const effective: WallSource = source === "recent" && hasStills ? "recent" : "black";

  const list = useMemo(() => (effective === "recent" ? data.stills : []), [effective, data.stills]);
  const currentUrl = list.length ? list[((idx % list.length) + list.length) % list.length] : null;

  useEffect(() => {
    if (!currentUrl) {
      setWallUrl(null);
      setDim(0);
      return;
    }
    let cancelled = false;
    void luminance(currentUrl).then((lum) => {
      if (cancelled) return;
      // 与旧主页一致：只压一层，范围 0.02–0.30，亮图才压。
      const next = Math.min(0.3, Math.max(0.02, ((lum ?? 0.4) - 0.34) * 0.75));
      setDim(next);
      setWallUrl(currentUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUrl]);

  useEffect(() => {
    if (effective === "black" || manual || list.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setIdx((i) => (i + 1) % list.length);
    }, RECENT_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [effective, manual, list.length, paused]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ src: effective, idx, manual }));
  }, [effective, idx, manual]);

  const changeSource = useCallback((next: WallSource) => {
    setSource(next);
    setIdx(0);
    setManual(false);
  }, []);

  const pick = useCallback((next: number) => {
    setIdx(next);
    setManual(true);
  }, []);

  const thumbs = list.slice(0, 12);

  return {
    source: effective,
    wallUrl,
    dim,
    thumbs,
    changeSource,
    pick,
    count: list.length,
    current: list.length ? ((idx % list.length) + list.length) % list.length : 0,
  };
}
