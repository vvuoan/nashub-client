export type IconName = "film" | "live" | "music" | "search" | "sub" | "gear";

export interface NavTile {
  id: string;
  name: string;
  icon: IconName;
  /** 磁贴底色；纯 UI 主题色，不承载业务数据。 */
  tone: string;
}

/** 「继续观看」条目：全部字段来自后端 /v1/progress/recent。 */
export interface ContinueItem {
  id: string;
  title: string;
  pct: number;
}

export type WallSource = "recent" | "black";

/**
 * 后端连接状态。
 * - loading：首次请求进行中
 * - ok：拿到数据且非空
 * - empty：后端可访问但当前没有内容
 * - unauthorized：401（本机 IP 不在白名单 / token 为空）
 * - unreachable：连不上（后端未启动 / 地址错误）
 * - error：其它失败（5xx、503 SOURCE_UNAVAILABLE 等）
 */
export type ConnState = "loading" | "ok" | "empty" | "unauthorized" | "unreachable" | "error";

export interface HomeData {
  tiles: NavTile[];
  continueItems: ContinueItem[];
  /** 壁纸候选：后端提供的剧照地址（backdrop 端点），前端不持有任何图片。 */
  stills: string[];
}

export interface HomeSnapshot {
  data: HomeData;
  state: ConnState;
  /** 失败时的可读原因；不与 state 冲突时可以同时给出。 */
  message: string | null;
}

export interface ScreenProfile {
  cssW: number;
  cssH: number;
  dpr: number;
  physW: number;
  physH: number;
  u: number;
  mbps: number;
}

/** 卡片展示数据：由数据层从后端字段映射而来，业务组件只读 props。 */
export interface MediaCardData {
  id: string;
  title: string;
  meta: string | null;
  poster: string | null;
  rating: number | null;
  /** 是否带「本地库」徽标 */
  local: boolean;
}

export interface MediaRowData {
  title: string;
  items: MediaCardData[];
}

/** 分类标签：key 对应 /v1/recommend 的 source。 */
export interface TagFilter {
  key: string;
  label: string;
}

/** 媒体库页的取数结果。 */
export interface LibrarySnapshot {
  state: ConnState;
  message: string | null;
  /** 影视首屏主视觉；其它页为 null */
  hero: MediaCardData | null;
  rows: MediaRowData[];
  /** 分类标签，真实标签来自 /v1/recommend/sources */
  tags: TagFilter[];
}
