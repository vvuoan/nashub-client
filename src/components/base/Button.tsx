import type { ReactNode } from "react";
import { Focusable } from "./Focusable";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
  focusKey?: string;
  className?: string;
  disabled?: boolean;
  /** 请求进行中：保留焦点与文案，禁止重复触发 */
  loading?: boolean;
  /** 选中/切换型按钮的当前态 */
  selected?: boolean;
  onSelect?: () => void;
}

/** 主/次按钮（画布 148×60，圆角 30）；状态由 disabled / loading / selected 表达。 */
export function Button({
  children,
  variant = "primary",
  icon,
  focusKey,
  className,
  disabled,
  loading,
  selected,
  onSelect,
}: ButtonProps) {
  return (
    <Focusable
      className={["btn", variant, loading ? "is-loading" : "", selected ? "on" : "", className]
        .filter(Boolean)
        .join(" ")}
      focusKey={focusKey}
      disabled={disabled}
      ariaBusy={loading}
      ariaPressed={selected}
      // 加载中仍可聚焦，但不重复触发
      onSelect={loading ? undefined : onSelect}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </Focusable>
  );
}
