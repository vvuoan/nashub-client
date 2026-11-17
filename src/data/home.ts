import type { HomeData, HomeSnapshot } from "../types";
import { TILES } from "./navigation";
import { ApiError, api, backdropUrl } from "./api";

const RECENT_LIMIT = 12;

export function initialHomeData(): HomeData {
  return { tiles: TILES, continueItems: [], stills: [] };
}

function pctOf(percent: number | null, positionTicks: number, durationSec: number): number {
  if (percent !== null && Number.isFinite(percent)) {
    return Math.max(0, Math.min(100, Math.round(percent)));
  }
  const total = durationSec * 10_000_000;
  if (!durationSec || !Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((positionTicks / total) * 100)));
}

export function describe(error: unknown): Pick<HomeSnapshot, "state" | "message"> {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return { state: "unauthorized", message: `${error.status} ${error.code}` };
    }
    return { state: "error", message: `${error.status} ${error.code}` };
  }
  if (error instanceof TypeError) {
    return { state: "unreachable", message: "无法连接后端" };
  }
  if (error instanceof Error) {
    return { state: "error", message: error.message };
  }
  return { state: "error", message: "未知错误" };
}

/**
 * 主页唯一数据入口：全部来自后端 openapi。
 * 没有本地 manifest / 演示数据；失败时如实返回状态，由 UI 显示未连接态与重试入口。
 */
export async function loadHomeData(): Promise<HomeSnapshot> {
  try {
    const page = await api.recentProgress(RECENT_LIMIT);
    const items = page.items ?? [];
    const continueItems = items
      .filter((item) => !item.completed)
      .map((item) => ({
        id: item.id,
        title: item.name,
        pct: pctOf(item.percent, item.positionTicks, item.durationSec),
      }));

    return {
      data: {
        tiles: TILES,
        continueItems,
        stills: items.slice(0, RECENT_LIMIT).map((item) => backdropUrl(item.id)),
      },
      state: items.length ? "ok" : "empty",
      message: null,
    };
  } catch (error) {
    return {
      data: initialHomeData(),
      ...describe(error),
    };
  }
}
