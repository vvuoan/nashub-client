import { useEffect } from "react";

export type Direction = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

/** 当前聚焦作用域（FocusScope 栈顶）；为空时退化为整页。 */
const scopes: HTMLElement[] = [];

export function pushScope(root: HTMLElement) {
  scopes.push(root);
}

export function popScope(root: HTMLElement) {
  const index = scopes.lastIndexOf(root);
  if (index >= 0) scopes.splice(index, 1);
}

export function activeScope(): HTMLElement | null {
  return scopes.length ? scopes[scopes.length - 1] : null;
}

export function isArrow(key: string): key is Direction {
  return key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight";
}

export const isBackKey = (key: string) =>
  key === "Escape" || key === "Backspace" || key === "BrowserBack";

export function visibleNav(root?: HTMLElement | null): HTMLElement[] {
  const scope = root ?? activeScope() ?? document.body;
  return Array.from(scope.querySelectorAll<HTMLElement>("[data-nav]")).filter((el) => {
    if (el.hasAttribute("disabled")) return false;
    if (el.closest("[aria-hidden='true']")) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.01;
  });
}

/** 焦点周围最近的滚动容器（含 overflow:hidden 的列表视窗）；纵向与横向分别查找。 */
function scrollContainerFor(el: HTMLElement, axis: "x" | "y"): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    if (axis === "y") {
      const canY =
        /(auto|scroll|hidden)/.test(style.overflowY) &&
        node.scrollHeight - node.clientHeight > 1;
      if (canY) return node;
    } else {
      // 横向只认真正的滚动容器，避免把 overflow:hidden 的裁切层当成平移容器
      const canX =
        /(auto|scroll)/.test(style.overflowX) &&
        node.scrollWidth - node.clientWidth > 1;
      if (canX) return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * 聚焦但不让浏览器瞬移，改为平滑滚动到可视区。
 * 纵向由列表承担：按「行组」（标题 + 卡片）整体显隐，避免把列表名称拆散，
 * 容器的 padding-top 视为可视区上沿（用于海报墙向上延伸的渐隐区）。
 * 横向由卡组行自己承担：焦点一直往右翻，行内平移，海报墙不动。
 */
function focusSmooth(el: HTMLElement) {
  el.focus({ preventScroll: true });

  const edge = 12;
  const plans = new Map<HTMLElement, { top: number; left: number }>();
  const planFor = (box: HTMLElement) => {
    let plan = plans.get(box);
    if (!plan) {
      plan = { top: box.scrollTop, left: box.scrollLeft };
      plans.set(box, plan);
    }
    return plan;
  };

  const yBox = scrollContainerFor(el, "y");
  if (yBox) {
    const padTop = parseFloat(getComputedStyle(yBox).paddingTop) || 0;
    const view = yBox.getBoundingClientRect();
    const vTop = view.top + padTop;
    const vh = view.height - padTop;
    const plan = planFor(yBox);

    const row = el.closest<HTMLElement>(".crow");
    const group = (row ?? el).getBoundingClientRect();

    if (group.height <= vh - edge * 2) {
      if (group.top < vTop + edge) plan.top += group.top - vTop - edge;
      else if (group.bottom > vTop + vh - edge) plan.top += group.bottom - (vTop + vh) + edge;
    } else if (group.top < vTop + edge || group.top > vTop + vh - 40) {
      plan.top += group.top - vTop - edge;
    }
  }

  const xBox = scrollContainerFor(el, "x");
  if (xBox) {
    const view = xBox.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const plan = planFor(xBox);
    if (rect.left < view.left + edge) plan.left += rect.left - view.left - edge;
    else if (rect.right > view.right - edge) plan.left += rect.right - view.right + edge;
  }

  for (const [box, plan] of plans) {
    if (
      Math.abs(plan.top - box.scrollTop) > 0.5 ||
      Math.abs(plan.left - box.scrollLeft) > 0.5
    ) {
      box.scrollTo({ top: plan.top, left: plan.left, behavior: "smooth" });
    }
  }
}

/** 几何评分：沿移动方向为主，垂直偏移加权 2.2。 */
export function moveFocus(direction: Direction): boolean {
  const nodes = visibleNav();
  if (!nodes.length) return false;

  const active = document.activeElement as HTMLElement | null;
  if (!active || !nodes.includes(active)) {
    focusSmooth(nodes[0]);
    return true;
  }

  const from = active.getBoundingClientRect();
  const fx = from.left + from.width / 2;
  const fy = from.top + from.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  // 主视觉操作区向下直接进海报墙：不回头落回左侧导航项。
  const downFromHero = direction === "ArrowDown" && !!active.closest(".lhero-actions");
  const candidates = downFromHero
    ? nodes.filter((node) => !node.closest(".navrail") && !node.closest(".navtab"))
    : nodes;

  for (const node of candidates) {
    if (node === active) continue;
    const rect = node.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - fx;
    const dy = rect.top + rect.height / 2 - fy;

    let along = 0;
    let across = 0;
    if (direction === "ArrowRight") {
      if (dx <= 8) continue;
      along = dx;
      across = Math.abs(dy);
    } else if (direction === "ArrowLeft") {
      if (dx >= -8) continue;
      along = -dx;
      across = Math.abs(dy);
    } else if (direction === "ArrowDown") {
      if (dy <= 8) continue;
      along = dy;
      across = Math.abs(dx);
    } else {
      if (dy >= -8) continue;
      along = -dy;
      across = Math.abs(dx);
    }

    const score = along + across * 2.2;
    if (score < bestScore) {
      bestScore = score;
      best = node;
    }
  }

  if (best) {
    focusSmooth(best);
    return true;
  }
  return false;
}

export function focusFirst(selector: string): boolean {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return false;
  el.focus();
  return true;
}

interface SpatialNavOptions {
  onBack?: () => void;
  onActivity?: () => void;
  enabled?: boolean;
  /** 先于几何导航执行；返回 true 表示已处理，本次方向键不再找最近元素 */
  onBeforeMove?: (direction: Direction) => boolean;
}

/** 通用遥控器方向键 / 返回键处理；页面只传回调。 */
export function useSpatialNav({ onBack, onActivity, enabled = true, onBeforeMove }: SpatialNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isArrow(event.key)) {
        event.preventDefault();
        onActivity?.();
        if (onBeforeMove?.(event.key)) return;
        moveFocus(event.key);
        return;
      }
      if (onBack && isBackKey(event.key)) {
        event.preventDefault();
        onBack();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onBack, onActivity, onBeforeMove]);
}
