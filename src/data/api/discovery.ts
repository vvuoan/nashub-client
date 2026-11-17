/**
 * 发现页趋势数据：`GET /v1/discovery/trending`。
 * 新栈没有"按 source 推荐"，top250 之类的远程榜单只能用趋势接口近似；
 * TMDB 未配置时后端返回 `configured=false` + 空 items，页面自然降级为空行。
 */
import type { components } from "../openapi";
import { request } from "../http";
import { clamp } from "./shared";

type DiscoveryItem = components["schemas"]["DiscoveryItem"];
type DiscoveryListResponse = components["schemas"]["DiscoveryListResponse"];

export async function trendingItems(
  mediaType: "movie" | "tv" = "movie",
  window: "day" | "week" = "week",
  page = 1,
): Promise<DiscoveryItem[]> {
  const query = new URLSearchParams({
    mediaType,
    window,
    page: String(clamp(page, 1, 20)),
  });
  const result = await request<DiscoveryListResponse>(`/v1/discovery/trending?${query.toString()}`);
  return result.items ?? [];
}

/** TMDB 给的是绝对地址；相对地址按后端 base 补齐。 */
export function absoluteImage(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${window.location.origin}${path}`;
}
