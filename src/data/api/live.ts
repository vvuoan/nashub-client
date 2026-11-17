/**
 * 直播：`GET /v1/live/channels` 与 `GET /v1/live/epg`。
 *
 * 新栈没有直播分组接口，分组从 channels 的 `group` 字段在前端聚合；
 * 旧调用方的 `limit/offset` 在这里翻译成新栈的 `page/pageSize`。
 */
import type { components } from "../openapi";
import { request } from "../http";
import { clamp, firstCount } from "./shared";

type RawChannel = components["schemas"]["LiveChannel"];
type RawProgramme = components["schemas"]["LiveProgramme"];
type RawEpg = components["schemas"]["LiveEpgResponse"];
type RawChannelsPage = components["schemas"]["LiveChannelsResponse"];

/** 新 spec 的 EPG 是 `{channelId, items:[start_at/stop_at...]}`；同时容忍已被上层算好的形状。 */
type RawEpgShape = RawEpg & {
  current?: unknown;
  upcoming?: unknown;
  matched?: boolean;
  count?: number | string | null;
  total?: number | string | null;
  fetchedAt?: string | null;
};

type ProgrammeLike = Partial<RawProgramme> & {
  startAt?: string | null;
  stopAt?: string | null;
  description?: string | null;
};

/** 已知分组键；后端 group 是自由文本，UI 用 string 承载未知分组。 */
export type LiveGroupKey = string;

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
  /** 新栈没有更新时间字段，留空而不是伪造当前时间。 */
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

const GROUP_LABELS: Record<string, string> = {
  cctv: "央视",
  satellite: "卫视",
  local: "地方",
  hk_mo_tw: "港澳台",
  other: "其它",
};

const KNOWN_GROUPS = ["cctv", "satellite", "local", "hk_mo_tw", "other"];

function normalizeChannel(raw: RawChannel): LiveChannel {
  return {
    channelId: raw.id,
    name: raw.name,
    group: raw.group ?? "",
    logo: raw.logo ?? null,
    tvgId: raw.tvgId ?? null,
    m3uGroupTitle: null,
    source: raw.source ?? null,
    streamCount: Array.isArray(raw.streamUrls) ? raw.streamUrls.length : 0,
    updatedAt: "",
  };
}

/** 兼容 start_at/stop_at（插件）与 startAt/stopAt（已归一化）；坏时间戳整条丢弃。 */
function toProgramme(raw: unknown): LiveProgramme | null {
  if (raw === null || typeof raw !== "object") return null;
  const item = raw as ProgrammeLike;
  const startAt = item.startAt ?? item.start_at;
  const stopAt = item.stopAt ?? item.stop_at;
  if (!startAt || !stopAt) return null;
  if (!Number.isFinite(Date.parse(startAt)) || !Number.isFinite(Date.parse(stopAt))) return null;
  return {
    title: typeof item.title === "string" ? item.title : "",
    description: item.description ?? null,
    startAt,
    stopAt,
  };
}

function isProgramme(value: LiveProgramme | null): value is LiveProgramme {
  return value !== null;
}

function byStartAt(a: LiveProgramme, b: LiveProgramme): number {
  return Date.parse(a.startAt) - Date.parse(b.startAt);
}

export interface LiveChannelsOptions {
  group?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export async function liveChannels(options: LiveChannelsOptions = {}): Promise<LiveChannelPage> {
  const limit = clamp(options.limit ?? 50, 1, 500);
  const offset = Math.max(0, Math.floor(options.offset ?? 0));
  const page = Math.floor(offset / limit) + 1;
  const query = new URLSearchParams({ page: String(page), pageSize: String(limit) });
  if (options.group) query.set("group", options.group);
  if (options.q) query.set("q", options.q);

  const result = await request<RawChannelsPage>(`/v1/live/channels?${query.toString()}`);
  const items = (result.items ?? []).map(normalizeChannel);
  return {
    items,
    count: result.total,
    total: result.total,
    offset: (page - 1) * limit,
    limit,
  };
}

/** 分组页签：最多读 5 页 × 500 频道，避免为分组统计发起无限请求。 */
const GROUP_PAGE_SIZE = 500;
const GROUP_MAX_PAGES = 5;

export async function liveGroups(): Promise<LiveGroupsResponse> {
  const counts = new Map<string, number>();
  for (let page = 1; page <= GROUP_MAX_PAGES; page++) {
    const result = await request<RawChannelsPage>(
      `/v1/live/channels?page=${page}&pageSize=${GROUP_PAGE_SIZE}`,
    );
    for (const channel of result.items ?? []) {
      const group = (channel.group ?? "").trim() || "other";
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
    if (!result.hasMore || !(result.items ?? []).length) break;
  }

  const items = [...counts.entries()]
    .map(([group, count]) => ({ group, label: GROUP_LABELS[group] ?? group, count }))
    .sort((a, b) => {
      const ai = KNOWN_GROUPS.indexOf(a.group);
      const bi = KNOWN_GROUPS.indexOf(b.group);
      if (ai !== bi) return (ai < 0 ? KNOWN_GROUPS.length : ai) - (bi < 0 ? KNOWN_GROUPS.length : bi);
      return b.count - a.count || a.group.localeCompare(b.group);
    });
  return { items, count: items.length };
}

/** 节目单：`limit` 是调用方想要的 upcoming 条数（下限 5，与新栈一次返回全量配合）。 */
const EPG_MIN_LIMIT = 5;

export async function liveEpg(channelId: string, limit = 5): Promise<LiveEpgResponse> {
  const query = new URLSearchParams({ channelId });
  const result = (await request<RawEpg>(`/v1/live/epg?${query.toString()}`)) as RawEpgShape;
  const rawItems = Array.isArray(result.items) ? result.items : null;
  // 插件形状一定带 items 数组；没有 items 且出现 current/upcoming 时采信已算好的结果。
  const clientShaped =
    rawItems === null &&
    (Array.isArray(result.upcoming) ||
      (result.current !== null && typeof result.current === "object"));
  // 调用方要更多就给更多（useLivePage 的 GUIDE_EPG_LIMIT=20），5 只是下限。
  const wanted = Number.isFinite(limit) ? Math.max(EPG_MIN_LIMIT, Math.floor(limit)) : EPG_MIN_LIMIT;
  const now = Date.now();

  let current: LiveProgramme | null = null;
  let upcoming: LiveProgramme[] = [];
  let matched: boolean;
  let count: number;

  if (clientShaped) {
    current = toProgramme(result.current);
    upcoming = (Array.isArray(result.upcoming) ? result.upcoming : [])
      .map(toProgramme)
      .filter(isProgramme)
      .sort(byStartAt)
      .slice(0, wanted);
    matched =
      typeof result.matched === "boolean"
        ? result.matched
        : current !== null || upcoming.length > 0;
    count =
      firstCount(result.count, result.total, upcoming.length + (current === null ? 0 : 1)) ?? 0;
  } else {
    const programmes = (rawItems ?? []).map(toProgramme).filter(isProgramme);
    const futures: LiveProgramme[] = [];
    for (const programme of programmes) {
      const start = Date.parse(programme.startAt);
      const stop = Date.parse(programme.stopAt);
      if (start > now) futures.push(programme);
      // 半开区间：start <= now < stop；已播完的整条丢弃。
      else if (current === null && now < stop) current = programme;
    }
    upcoming = futures.sort(byStartAt).slice(0, wanted);
    matched = (rawItems?.length ?? 0) > 0;
    // count 表示后端本次返回的条数：时间解析失败被丢出的条目仍计入（与可渲染条数不同）。
    count = firstCount(result.count, result.total, rawItems?.length ?? 0) ?? 0;
  }

  return {
    channelId: result.channelId || channelId,
    matched,
    current,
    upcoming,
    count,
    fetchedAt: result.fetchedAt || new Date(now).toISOString(),
  };
}
