import type { ConnState } from "../types";

/**
 * 组件状态模型（契约见 docs/design/14-component-state-contract.md）。
 * 数据态只有这六个取值；焦点 / 选中 / 勾选属于交互态，由 CSS 与 aria 表达。
 */
export type UiStatus = "idle" | "loading" | "ok" | "empty" | "error" | "disabled";

export type UiTone = "ok" | "warn" | "muted" | "busy" | "danger";

/** 胶囊默认文案：组件不传 children 时用它兜底。 */
export const STATUS_LABEL: Record<UiStatus, string> = {
  idle: "待机",
  loading: "加载中",
  ok: "正常",
  empty: "暂无数据",
  error: "出错",
  disabled: "不可用",
};

export const STATUS_TONE: Record<UiStatus, UiTone> = {
  idle: "muted",
  loading: "busy",
  ok: "ok",
  empty: "muted",
  error: "danger",
  disabled: "muted",
};

/** 连接态 → 组件状态：401 / 连不上 / 5xx 都是 error，只是文案不同。 */
export function statusOf(conn: ConnState): UiStatus {
  if (conn === "ok") return "ok";
  if (conn === "loading") return "loading";
  if (conn === "empty") return "empty";
  return "error";
}
