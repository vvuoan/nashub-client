/**
 * 收藏：`GET /v1/collections/favorites`。
 * 后端没有 offset/limit 参数，客户端按旧签名在本地切片；字段由 snake_case 映射到 UI 的 camelCase。
 */
import type { components } from "../openapi";
import { request } from "../http";
import { clamp } from "./shared";

type RawFavorite = components["schemas"]["CollectionFavorite"];

export interface FavoriteItem {
  id: number;
  itemType: string;
  itemId: string;
  titleSnapshot: string;
  createdAt: string;
}

export interface FavoritePage {
  items: FavoriteItem[];
  count: number;
  total: number;
  offset: number;
  limit: number;
}

export async function favorites(offset = 0, limit = 50): Promise<FavoritePage> {
  const result = await request<{ items?: RawFavorite[] }>("/v1/collections/favorites");
  const all = (result.items ?? []).map((item) => ({
    id: item.id,
    itemType: item.item_type,
    itemId: item.item_id,
    titleSnapshot: item.title_snapshot ?? "",
    createdAt: item.created_at,
  }));
  const start = Math.max(0, Math.floor(offset));
  const size = clamp(limit, 1, 500);
  return {
    items: all.slice(start, start + size),
    count: all.length,
    total: all.length,
    offset: start,
    limit: size,
  };
}
