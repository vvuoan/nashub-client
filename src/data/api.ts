/**
 * 后端 openapi 客户端。
 *
 * 边界：
 * - 前端只做 UI，不持有任何业务数据；所有内容（继续观看、壁纸剧照）都从本层取。
 * - 后端当前 401（本机 IP 不在白名单、token 为空），未连接时由 data/home.ts 映射成
 *   unreachable / unauthorized / error，界面显示真实失败态，不伪造数据。
 * - 图片：海报端点 `/v1/media/{id}/poster?width=` 支持宽度；`/v1/media/{id}/backdrop`
 *   目前不收 width 参数，因此背景图按后端原图取，不臆造参数。
 * - 字段适配只在这一层做：插件返回的字段名与 UI 约定不一致时（例如 `id`/`channelId`、
 *   `item_type`/`itemType`），在这里归一化，页面调用方仍按 `types.ts` 的结构取数。
 */
const DEFAULT_BASE = "http://127.0.0.1:2003";

/** 单个请求的超时上限：内核本机部署，超过 8s 基本等于不可达，早失败早显示重试。 */
const REQUEST_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId: string | null;

  constructor(status: number, code: string, message: string, traceId: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.traceId = traceId;
  }
}

export function baseUrl(): string {
  const override = localStorage.getItem("ntv.apiBase");
  return (override || import.meta.env.VITE_API_BASE || DEFAULT_BASE).replace(/\/$/, "");
}

function authToken(): string | null {
  return localStorage.getItem("ntv.token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  const token = authToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // 后端不可达时 fetch 会挂到系统级超时（可能几十秒），主页会长时间停在 loading。
  // 这里用 AbortController 兜一层，超时统一抛 ApiError(code=timeout, status=0)。
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, { ...init, headers, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError(0, "timeout", `请求超时（${REQUEST_TIMEOUT_MS / 1000}s）：${path}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let code = `HTTP_${res.status}`;
    let message = res.statusText || "request failed";
    let traceId = res.headers.get("X-Trace-Id");
    try {
      const body = (await res.json()) as { code?: string; message?: string; traceId?: string };
      code = body.code ?? code;
      message = body.message ?? message;
      traceId = body.traceId ?? traceId;
    } catch {
      // 非 JSON 错误体，保留 HTTP 状态
    }
    throw new ApiError(res.status, code, message, traceId);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** /v1/progress/recent 的条目（字段名与后端 alias 一致）。 */
export interface RecentItem {
  id: string;
  name: string;
  type: string;
  year: number | null;
  durationSec: number;
  positionTicks: number;
  percent: number | null;
  updatedAt: string | null;
  completed: boolean;
}

export interface RecentPage {
  items: RecentItem[];
  count: number;
}

export interface HomeOverview {
  generatedAt: string;
  weather: {
    state: string;
    city: string | null;
    temperature: number | null;
    unit: string | null;
    condition: string | null;
    icon: string | null;
    observedAt: string | null;
    updatedAt: string | null;
    stale: boolean;
    reason: string | null;
  };
  lunar: {
    date: string;
    month: number;
    day: number;
    monthName: string;
    dayName: string;
    label: string;
    ganzhi: string;
    zodiac: string;
    festival: string | null;
    solarTerm: string | null;
    display: string | null;
  };
  degraded: { source: string; reason: string }[];
}

/** 海报：后端支持 width（32–2000，等比缩放、不放大）。 */
export function posterUrl(id: string, width?: number): string {
  const q = width ? `?width=${Math.round(width)}` : "";
  return `${baseUrl()}/v1/media/${encodeURIComponent(id)}/poster${q}`;
}

/** 背景图：后端该端点没有 width 参数，这里不附加。 */
export function backdropUrl(id: string): string {
  return `${baseUrl()}/v1/media/${encodeURIComponent(id)}/backdrop`;
}

/* ---------- 媒体库 / 推荐 / 收藏 / 搜索：结构与 openapi 对齐 ---------- */

export interface LibrarySummary {
  id: string;
  name: string;
  collectionType: string;
}

export interface LibraryListResponse {
  libraries: LibrarySummary[];
  count: number;
}

/** ItemSummary：库内条目，卡片所需字段一次带回。 */
export interface ItemSummary {
  id: string;
  name: string;
  type: string;
  year: number | null;
  durationSec: number;
  durationReliable: false;
  posterUrl: string | null;
  rating: number | null;
  genres: string[];
  addedAt: string | null;
}

export interface ItemPage {
  items: ItemSummary[];
  total: number;
  startIndex: number;
  limit: number;
}

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

/* ---------- 直播 / 音乐：结构与 openapi 对齐 ---------- */

export type LiveGroupKey = "cctv" | "satellite" | "local" | "hk_mo_tw" | "other";

export interface LiveGroupCount {
  group: LiveGroupKey;
  label: string;
  count: number;
}

export interface LiveGroupsResponse {
  items: LiveGroupCount[];
  count: number;
}

export interface LiveChannel {
  channelId: string;
  name: string;
  group: string;
  logo: string | null;
  tvgId?: string | null;
  m3uGroupTitle?: string | null;
  source: string | null;
  streamCount: number;
  updatedAt: string;
}

export interface LiveChannelPage {
  items: LiveChannel[];
  count: number;
  total: number;
  offset: number;
  limit: number;
}

export interface LiveProgramme {
  title: string;
  description: string | null;
  startAt: string;
  stopAt: string;
}

export interface LiveEpgResponse {
  channelId: string;
  matched: boolean;
  tvgId?: string | null;
  current: LiveProgramme | null;
  upcoming: LiveProgramme[];
  count: number;
  fetchedAt?: string | null;
}

export interface LiveStreamInfo {
  channelId: string;
  index: number;
  url: string;
}

export interface MusicStatusResponse {
  configured: boolean;
  baseUrl?: string | null;
  message: string;
}

/* ---------- 响应归一化：插件字段 → UI 约定字段 ---------- */

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value !== null && typeof value === "object" ? (value as RawRecord) : {};
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function asNumber(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/** 把插件返回的相对图片路径补成绝对 URL；已是绝对地址则原样返回。 */
function absoluteImage(value: unknown): string | null {
  const path = asString(value);
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** 直播频道：插件用 `id`，UI 用 `channelId`。 */
function normalizeLiveChannel(raw: unknown): LiveChannel {
  const item = asRecord(raw);
  return {
    ...(item as unknown as LiveChannel),
    channelId: asString(item.channelId ?? item.id),
    name: asString(item.name),
    group: asString(item.group),
    logo: item.logo === null || item.logo === undefined ? null : asString(item.logo),
    source: item.source === null || item.source === undefined ? null : asString(item.source),
    streamCount: asNumber(item.streamCount, 0),
    updatedAt: asString(item.updatedAt),
  };
}

/** 直播分页：插件回 `total`/`pageSize`，UI 期望 `count`/`limit` 齐全。 */
function normalizeLiveChannelPage(raw: unknown): LiveChannelPage {
  const page = asRecord(raw);
  const items = Array.isArray(page.items) ? page.items.map(normalizeLiveChannel) : [];
  return {
    ...(page as unknown as LiveChannelPage),
    items,
    count: asNumber(page.count ?? page.total, items.length),
    total: asNumber(page.total ?? page.count, items.length),
    offset: asNumber(page.offset, 0),
    limit: asNumber(page.limit ?? page.pageSize, items.length),
  };
}

/** 收藏：插件回 snake_case，UI 期望 camelCase。 */
function normalizeFavorite(raw: unknown): FavoriteItem {
  const item = asRecord(raw);
  return {
    ...(item as unknown as FavoriteItem),
    id: asNumber(item.id, 0),
    itemType: asString(item.itemType ?? item.item_type),
    itemId: asString(item.itemId ?? item.item_id),
    titleSnapshot: asString(item.titleSnapshot ?? item.title_snapshot),
    createdAt: asString(item.createdAt ?? item.created_at),
  };
}

function normalizeFavoritePage(raw: unknown): FavoritePage {
  const page = asRecord(raw);
  const items = Array.isArray(page.items) ? page.items.map(normalizeFavorite) : [];
  return {
    ...(page as unknown as FavoritePage),
    items,
    count: asNumber(page.count ?? page.total, items.length),
    total: asNumber(page.total ?? page.count, items.length),
    offset: asNumber(page.offset, 0),
    limit: asNumber(page.limit ?? page.pageSize, items.length),
  };
}

/** 检索：`posterUrl` 缺失时用 `posterPath` 或别名端点 `/v1/media/{id}/poster` 兜底。 */
function normalizeSearchItem(raw: unknown): MediaSearchItem {
  const item = asRecord(raw);
  const itemId = asString(item.itemId ?? item.id);
  const poster =
    absoluteImage(item.posterUrl) ??
    absoluteImage(item.posterPath) ??
    (itemId ? posterUrl(itemId) : null);
  return {
    ...(item as unknown as MediaSearchItem),
    itemId,
    title: asString(item.title),
    originalTitle:
      item.originalTitle === null || item.originalTitle === undefined
        ? null
        : asString(item.originalTitle),
    year: item.year === null || item.year === undefined ? null : asNumber(item.year, 0) || null,
    type: asString(item.type),
    rating: item.rating === null || item.rating === undefined ? null : asNumber(item.rating, 0),
    posterUrl: poster,
  };
}

function normalizeSearchPage(raw: unknown): MediaSearchPage {
  const page = asRecord(raw);
  const items = Array.isArray(page.items) ? page.items.map(normalizeSearchItem) : [];
  return {
    ...(page as unknown as MediaSearchPage),
    items,
    count: asNumber(page.count ?? page.total, items.length),
  };
}

export const api = {
  health: () => request<{ status: string }>("/v1/health"),
  homeOverview: () => request<HomeOverview>("/v1/home/overview"),
  recentProgress: (limit = 12) =>
    request<RecentPage>(`/v1/progress/recent?limit=${Math.max(1, Math.min(50, limit))}`),
  getSettings: () => request<Record<string, unknown>>("/v1/settings"),
  patchSettings: (patch: Record<string, unknown>) =>
    request<Record<string, unknown>>("/v1/settings", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  mpSearch: (q: string, page = 1) =>
    request<unknown>(`/v1/mp/search?q=${encodeURIComponent(q)}&page=${page}`),
  mpSubscriptions: () => request<unknown>("/v1/mp/subscriptions"),
  libraries: () => request<LibraryListResponse>("/v1/library/libraries"),
  libraryItems: (
    libraryId: string,
    options: { limit?: number; startIndex?: number; type?: "Movie" | "Series" | "Episode" } = {},
  ) => {
    const query = new URLSearchParams();
    query.set("limit", String(Math.max(1, Math.min(200, options.limit ?? 50))));
    query.set("startIndex", String(Math.max(0, options.startIndex ?? 0)));
    if (options.type) query.set("type", options.type);
    return request<ItemPage>(
      `/v1/library/${encodeURIComponent(libraryId)}/items?${query.toString()}`,
    );
  },
  recommend: (source: RecommendSourceName = "showing", page = 1, count = 20) =>
    request<RecommendResponse>(
      `/v1/recommend?source=${source}&page=${page}&count=${Math.max(1, Math.min(50, count))}`,
    ),
  recommendSources: () => request<{ sources: RecommendSource[] }>("/v1/recommend/sources"),
  favorites: (offset = 0, limit = 50) =>
    request<unknown>(`/v1/favorites?offset=${offset}&limit=${limit}`).then(normalizeFavoritePage),
  search: (q: string, limit = 20, type?: "movie" | "series" | "anime") => {
    const query = new URLSearchParams();
    query.set("q", q);
    query.set("limit", String(Math.max(1, Math.min(50, limit))));
    if (type) query.set("type", type);
    return request<unknown>(`/v1/search?${query.toString()}`).then(normalizeSearchPage);
  },
  liveGroups: () => request<LiveGroupsResponse>("/v1/live/groups"),
  liveChannels: (options: { group?: string; q?: string; limit?: number; offset?: number } = {}) => {
    const limit = Math.max(1, Math.min(200, options.limit ?? 50));
    const offset = Math.max(0, options.offset ?? 0);
    const query = new URLSearchParams();
    if (options.group) query.set("group", options.group);
    if (options.q) query.set("q", options.q);
    // 插件分页参数是 page/pageSize（1 基页码），客户端调用方用 limit/offset，在这里翻译。
    query.set("pageSize", String(limit));
    query.set("page", String(Math.floor(offset / limit) + 1));
    return request<unknown>(`/v1/live/channels?${query.toString()}`).then(
      normalizeLiveChannelPage,
    );
  },
  liveEpg: (channelId: string, limit = 5) =>
    request<LiveEpgResponse>(
      `/v1/live/${encodeURIComponent(channelId)}/epg?limit=${Math.max(1, Math.min(50, limit))}`,
    ),
  liveStream: (channelId: string, index = 0) =>
    request<LiveStreamInfo>(
      `/v1/live/${encodeURIComponent(channelId)}/stream?index=${Math.max(0, index)}`,
    ),
  musicStatus: () => request<MusicStatusResponse>("/v1/music/status"),
  musicProbe: () => request<MusicStatusResponse>("/v1/music/probe"),
};
