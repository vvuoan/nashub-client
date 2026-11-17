/**
 * 数据层聚合出口。
 *
 * `api` 上只保留页面仍在用的方法名；它们的实现全部指向 runtime-openapi.json 里的新端点。
 * 新栈不存在的端点（旧的天气/农历聚合、音乐状态探测等）不在这里伪造请求。
 */
export * from "../http";
export * from "./catalog";
export * from "./collections";
export * from "./discovery";
export * from "./live";
export * from "./playback";

import type { components } from "../openapi";
import { request } from "../http";
import { favorites } from "./collections";
import { libraries, recommend, recommendSources, search } from "./catalog";
import { liveChannels, liveEpg, liveGroups } from "./live";
import { recentProgress } from "./playback";

/**
 * 页面仍引用的天气/农历结构。新后端没有对应接口，类型只用于让页面安全地降级为 null，
 * 不产生任何请求；HomePage 已按 `overview?.weather?.temperature` 做了不展示处理。
 */
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

export const api = {
  health: () => request<components["schemas"]["KernelHealthResponse"]>("/v1/health"),
  libraries,
  recentProgress,
  recommend,
  recommendSources,
  favorites,
  search,
  liveGroups,
  liveChannels,
  liveEpg,
};
