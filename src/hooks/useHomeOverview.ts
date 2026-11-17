import type { HomeOverview } from "../data/api";

/**
 * 天气 / 农历在 runtime-openapi.json 里没有对应接口（旧 home/overview 端点已下线）。
 * 页面本来就把这两个字段当可选：返回 null 即不展示，不伪造数据，也不发无效请求。
 */
export function useHomeOverview(): HomeOverview | null {
  return null;
}
