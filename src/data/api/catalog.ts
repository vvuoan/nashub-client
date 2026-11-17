/**
 * 媒体目录：`GET /v1/catalog/overview`、`/items`、`/search`。
 *
 * 新栈没有"按来源推荐"这类接口。为保留页面调用签名，
 * `recommend(source, page, count)` 在这里被翻译成下面的近似查询（详见 legacy-api-mapping.md）：
 *   showing  → catalog/overview.recent（客户端切片翻页）
 *   movie_hot→ catalog/items?type=Movie
 *   tv_hot   → catalog/items?type=Series
 *   anime    → catalog/items?type=Anime
 *   top250   → discovery/trending?mediaType=movie&window=week
 */
import type { components } from "../openapi";
import { request } from "../http";
import { clamp, firstCount } from "./shared";
import { absoluteImage, trendingItems } from "./discovery";
import { posterUrl } from "./playback";

type CatalogItem = components["schemas"]["CatalogItem"];
type DiscoveryItem = components["schemas"]["DiscoveryItem"];

export type RecommendSourceName = "showing" | "movie_hot" | "tv_hot" | "anime" | "top250";

export interface RecommendItem {
  title: string;
  year: number | null;
  poster: string | null;
  rating: number | null;
  mediaSource: string | null;
  mediaId: string | null;
  ids?: Record<string, string>;
}

export interface RecommendResponse {
  source: string;
  page: number;
  count: number;
  degraded: string[];
  items: RecommendItem[];
}

export interface RecommendSource {
  name: string;
  label: string;
}

export interface MediaSearchItem {
  itemId: string;
  title: string;
  originalTitle: string | null;
  year: number | null;
  type: string;
  rating: number | null;
  posterUrl: string | null;
}

export interface MediaSearchPage {
  items: MediaSearchItem[];
  count: number;
}

export interface LibrarySummary {
  id: string;
  name: string;
  collectionType: string;
}

export interface LibraryListResponse {
  libraries: LibrarySummary[];
  count: number;
}

/** 兼容旧 ItemSummary/ItemPage 的 consumer；新栈只用到 libraries/kind/count 三项。 */
type RawLibrary = Omit<components["schemas"]["CatalogLibrary"], "count"> & {
  libraryId?: string | null;
  collectionType?: string | null;
  count?: number | string | null;
};

/** source → 新栈目录类型；top250 走 discovery，showing 走 overview，故值为 null。 */
const SOURCE_TYPES: Record<RecommendSourceName, string | null> = {
  showing: null,
  movie_hot: "Movie",
  tv_hot: "Series",
  anime: "Anime",
  top250: null,
};

function fromCatalogItem(item: CatalogItem): RecommendItem {
  return {
    title: item.title,
    year: item.year ?? null,
    poster: posterUrl(item.itemId),
    rating: item.rating ?? null,
    mediaSource: item.source ?? null,
    mediaId: item.itemId,
  };
}

function fromDiscoveryItem(item: DiscoveryItem): RecommendItem {
  return {
    title: item.title ?? item.originalTitle ?? "",
    year: item.year ?? null,
    poster: absoluteImage(item.posterUrl),
    rating: item.rating ?? null,
    mediaSource: item.source ?? null,
    mediaId: item.tmdbId === null || item.tmdbId === undefined ? null : `tmdb:${item.tmdbId}`,
  };
}

function isSourceName(value: string): value is RecommendSourceName {
  return Object.prototype.hasOwnProperty.call(SOURCE_TYPES, value);
}

/** 保留旧签名，内部改走新栈；未知 source 退化为不限类型的目录分页。 */
export async function recommend(
  source: RecommendSourceName = "showing",
  page = 1,
  count = 20,
): Promise<RecommendResponse> {
  const wantedPage = clamp(page, 1, 1000);
  const pageSize = clamp(count, 1, 50);
  const target = isSourceName(source) ? source : "showing";
  let items: RecommendItem[] = [];

  if (target === "showing") {
    const overview = await request<{ recent?: CatalogItem[] }>("/v1/catalog/overview");
    items = (overview.recent ?? [])
      .slice((wantedPage - 1) * pageSize, wantedPage * pageSize)
      .map(fromCatalogItem);
  } else if (target === "top250") {
    const remote = await trendingItems("movie", "week", wantedPage);
    items = remote.slice(0, pageSize).map(fromDiscoveryItem);
  } else {
    const query = new URLSearchParams({
      page: String(wantedPage),
      pageSize: String(pageSize),
    });
    const mediaType = SOURCE_TYPES[target];
    if (mediaType) query.set("type", mediaType);
    const result = await request<{ items?: CatalogItem[] }>(
      `/v1/catalog/items?${query.toString()}`,
    );
    items = (result.items ?? []).map(fromCatalogItem);
  }

  return { source: target, page: wantedPage, count: items.length, degraded: [], items };
}

/**
 * 新栈没有推荐来源列表；返回空数组让页面隐藏分类标签（不伪造来源）。
 * 函数保留，是因为 useLibraryPage 的首屏会调用它来生成 tags。
 */
export async function recommendSources(): Promise<{ sources: RecommendSource[] }> {
  return { sources: [] };
}

/** 媒体库列表：`items → libraries`、`kind → collectionType`，count 做空值兜底但保留 0。 */
export async function libraries(): Promise<LibraryListResponse> {
  const result = await request<{
    items?: RawLibrary[];
    libraries?: RawLibrary[];
    count?: number | string | null;
    total?: number | string | null;
  }>("/v1/catalog/libraries");
  const source = Array.isArray(result.items)
    ? result.items
    : Array.isArray(result.libraries)
      ? result.libraries
      : [];
  const list = source.map((item) => ({
    id: item.id ?? item.libraryId ?? "",
    name: item.name,
    collectionType: (item.collectionType ?? "").trim() || item.kind,
  }));
  return { libraries: list, count: firstCount(result.count, result.total, list.length) ?? 0 };
}

/** 统一检索：`GET /v1/catalog/search?q=&pageSize=`。 */
export async function search(q: string, limit = 20, _type?: string): Promise<MediaSearchPage> {
  void _type;
  const query = new URLSearchParams({ q, pageSize: String(clamp(limit, 1, 200)) });
  const result = await request<{
    items?: CatalogItem[];
    count?: number | string | null;
    total?: number | string | null;
  }>(`/v1/catalog/search?${query.toString()}`);
  const items = (result.items ?? []).map((item) => ({
    itemId: item.itemId,
    title: item.title,
    originalTitle: item.originalTitle ?? null,
    year: item.year ?? null,
    type: item.type ?? "",
    rating: item.rating ?? null,
    posterUrl: posterUrl(item.itemId),
  }));
  return { items, count: firstCount(result.count, result.total, items.length) ?? items.length };
}
