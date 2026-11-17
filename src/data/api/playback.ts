/**
 * 播放进度：对接 `GET /v1/playback/progress?limit=`。
 *
 * 新栈的进度条目只有 itemId/ticks，没有标题；标题从 `GET /v1/catalog/items`
 * 的本地条目里补齐，目录请求失败时退回 itemId，不阻断首页继续观看。
 */
import type { components } from "../openapi";
import { baseUrl, request } from "../http";
import { clamp, ticksToSeconds } from "./shared";

type Progress = components["schemas"]["PlaybackProgress"];
type CatalogItem = components["schemas"]["CatalogItem"];

/** UI 约定的继续观看条目；字段名与页面消费方保持一致。 */
export interface RecentItem {
  id: string;
  name: string;
  type: string;
  year: number | null;
  durationSec: number;
  positionTicks: number;
  percent: number | null;
  updatedAt: string;
  completed: boolean;
}

export interface RecentPage {
  items: RecentItem[];
  count: number;
}

async function catalogTitles(): Promise<Map<string, CatalogItem>> {
  try {
    const page = await request<{ items?: CatalogItem[] }>("/v1/catalog/items?page=1&pageSize=200");
    return new Map((page.items ?? []).map((item) => [item.itemId, item]));
  } catch {
    // 目录不可用时仍展示进度 id；主请求失败不会被这里吞掉。
    return new Map();
  }
}

function toPercent(positionTicks: number, durationTicks: number): number | null {
  if (!Number.isFinite(durationTicks) || durationTicks <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((positionTicks / durationTicks) * 100)));
}

export async function recentProgress(limit = 12): Promise<RecentPage> {
  const wanted = clamp(limit, 1, 200);
  const [progress, titles] = await Promise.all([
    request<{ items?: Progress[] }>(`/v1/playback/progress?limit=${wanted}`),
    catalogTitles(),
  ]);
  const items = (progress.items ?? []).map((entry) => {
    const meta = titles.get(entry.itemId);
    return {
      id: entry.itemId,
      name: meta?.title ?? entry.itemId,
      type: meta?.type ?? "",
      year: meta?.year ?? null,
      durationSec: ticksToSeconds(entry.durationTicks),
      positionTicks: entry.positionTicks,
      percent: toPercent(entry.positionTicks, entry.durationTicks),
      updatedAt: entry.updatedAt,
      completed: entry.completed,
    };
  });
  return { items, count: items.length };
}

/** 新栈图片端点：`/v1/catalog/items/{id}/images/{kind}`（kind 仅 poster/backdrop）。 */
export function imageUrl(id: string, kind: "poster" | "backdrop"): string {
  return `${baseUrl()}/v1/catalog/items/${encodeURIComponent(id)}/images/${kind}`;
}

/** 兼容旧签名：新端点不支持 width（按原图返回），入参保留但不发到后端。 */
export function posterUrl(id: string, _width?: number): string {
  return imageUrl(id, "poster");
}

export function backdropUrl(id: string): string {
  return imageUrl(id, "backdrop");
}
