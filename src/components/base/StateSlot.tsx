import type { ReactNode } from "react";
import type { UiStatus } from "../../ui/state";

interface StateSlotProps {
  status: UiStatus;
  /** status === "ok" 时渲染的内容 */
  children?: ReactNode;
  /** 骨架内容；缺省是一条标准占位条 */
  skeleton?: ReactNode;
  emptyText?: string;
  emptyHint?: string;
  errorText?: string;
  errorHint?: string;
  /** 错误态的补救动作（重试按钮等） */
  action?: ReactNode;
  className?: string;
}

const DEFAULT_EMPTY = "暂无内容";
const DEFAULT_ERROR = "加载失败";
const DEFAULT_ERROR_HINT = "检查后端连接后重试";

/**
 * 统一渲染数据态：loading → 骨架，empty → 空态文案，error → 错误 + 补救动作，
 * disabled → 不可用说明，idle → 不占位，ok → 子节点。
 */
export function StateSlot({
  status,
  children,
  skeleton,
  emptyText,
  emptyHint,
  errorText,
  errorHint,
  action,
  className,
}: StateSlotProps) {
  const cls = ["state-slot", status, className].filter(Boolean).join(" ");

  if (status === "ok") return <>{children}</>;
  if (status === "idle") return null;
  if (status === "loading") {
    return (
      <div className={cls} aria-busy="true">
        {skeleton ?? <span className="state-line" aria-hidden="true" />}
      </div>
    );
  }
  if (status === "disabled") {
    return (
      <div className={cls} aria-disabled="true">
        <p>当前不可用</p>
      </div>
    );
  }

  const empty = status === "empty";
  return (
    <div className={cls} role="status">
      <p>{empty ? (emptyText ?? DEFAULT_EMPTY) : (errorText ?? DEFAULT_ERROR)}</p>
      {(empty ? emptyHint : (errorHint ?? DEFAULT_ERROR_HINT)) && (
        <span>{empty ? emptyHint : (errorHint ?? DEFAULT_ERROR_HINT)}</span>
      )}
      {!empty && action}
    </div>
  );
}
