import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { focusFirst, popScope, pushScope, visibleNav } from "../../focus/spatial";

interface FocusScopeProps {
  /** 作用域标识，用于恢复焦点（如路由名、弹层名） */
  name: string;
  children: ReactNode;
  className?: string;
  /** 挂载后是否自动聚焦第一个可聚焦元素 */
  autoFocus?: boolean;
  /** 离开时保存当前焦点、下次进入时恢复 */
  remember?: boolean;
  /** 作用域内的按键处理；在焦点元素冒泡到 window 之前执行 */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

const memory = new Map<string, string>();

/**
 * 焦点作用域：方向键只在作用域内移动，并在进出时恢复焦点。
 * 页面、弹层、播放控制条都可以复用。
 */
export function FocusScope({
  name,
  children,
  className,
  autoFocus = true,
  remember = true,
  onKeyDown,
}: FocusScopeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    pushScope(root);

    // 记录作用域内最后一次聚焦的键：元素被移除后 activeElement 会退回 body，
    // 只在卸载时读 activeElement 会丢掉焦点记忆。
    let lastKey: string | undefined;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.dataset.focusKey) lastKey = target.dataset.focusKey;
    };
    root.addEventListener("focusin", onFocusIn);

    const saved = remember ? memory.get(name) : undefined;
    const raf = window.requestAnimationFrame(() => {
      if (saved) {
        const target = root.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(saved)}"]`);
        if (target) {
          target.focus();
          return;
        }
      }
      if (autoFocus) {
        const first = visibleNav(root)[0];
        first?.focus();
      }
    });

    return () => {
      window.cancelAnimationFrame(raf);
      root.removeEventListener("focusin", onFocusIn);
      const active = document.activeElement as HTMLElement | null;
      const key = (active && root.contains(active) ? active.dataset.focusKey : undefined) ?? lastKey;
      if (remember && key) memory.set(name, key);
      popScope(root);
    };
  }, [name, autoFocus, remember]);

  return (
    <div ref={ref} className={className} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}

export { focusFirst };
