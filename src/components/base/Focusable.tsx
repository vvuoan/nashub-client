import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

export interface FocusableProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 焦点记忆键，稳定且在同一作用域内唯一 */
  focusKey?: string;
  disabled?: boolean;
  ariaLabel?: string;
  /** 数据加载中：仍可聚焦，但读屏会提示忙碌 */
  ariaBusy?: boolean;
  /** 选中/按下态（开关、页签、筛选项） */
  ariaPressed?: boolean;
  onSelect?: () => void;
  onFocus?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * 遥控器可聚焦元素：统一 data-nav / data-focus-key 与点击语义。
 * 不感知路由、数据与业务类型。
 */
export function Focusable({
  children,
  className,
  style,
  focusKey,
  disabled,
  ariaLabel,
  ariaBusy,
  ariaPressed,
  onSelect,
  onFocus,
  onKeyDown,
}: FocusableProps) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      data-nav
      data-focus-key={focusKey}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-busy={ariaBusy || undefined}
      aria-pressed={ariaPressed}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
