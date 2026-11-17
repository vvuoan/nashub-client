import type { NavTile } from "../types";
import type { NavIconName } from "../components/base/NavIcon";

/** 首页入口是产品配置，不是演示数据。 */
export const TILES: NavTile[] = [
  { id: "library", name: "影视", icon: "film", tone: "#1c3f7a" },
  { id: "live", name: "直播", icon: "live", tone: "#7a2140" },
  { id: "music", name: "音乐", icon: "music", tone: "#3a2a6b" },
  { id: "search", name: "搜索", icon: "search", tone: "#2b2f36" },
  { id: "subscribe", name: "订阅", icon: "sub", tone: "#2f5a45" },
  { id: "settings", name: "设置", icon: "gear", tone: "#4f3a2c" },
];

export const ROUTES = [
  "home",
  "recommend",
  "movie",
  "tv",
  "anime",
  "favorites",
  "search",
  "detail",
  "player",
  "live",
  "music",
  "subscribe",
  "settings",
] as const;

export type RouteName = (typeof ROUTES)[number];

export interface NavItem {
  route: RouteName;
  label: string;
  icon: NavIconName;
}

/** 画布「导航栏 · 展开」六项：推荐 / 电影 / 电视剧 / 动漫 / 收藏 / 搜索。 */
export const NAV_ITEMS: NavItem[] = [
  { route: "recommend", label: "推荐", icon: "recommend" },
  { route: "movie", label: "电影", icon: "movie" },
  { route: "tv", label: "电视剧", icon: "tv" },
  { route: "anime", label: "动漫", icon: "anime" },
  { route: "favorites", label: "收藏", icon: "favorites" },
  { route: "search", label: "搜索", icon: "search" },
];

export const NAV_ROUTES = new Set<RouteName>(NAV_ITEMS.map((item) => item.route));

export function routeForTile(tileId: string): RouteName {
  switch (tileId) {
    case "library":
      return "recommend";
    case "live":
      return "live";
    case "music":
      return "music";
    case "search":
      return "search";
    case "subscribe":
      return "subscribe";
    default:
      return "settings";
  }
}
