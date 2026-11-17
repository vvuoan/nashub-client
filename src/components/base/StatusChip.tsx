import type { ReactNode } from "react";
import { STATUS_LABEL, STATUS_TONE, type UiStatus } from "../../ui/state";

export type ChipTone = "ok" | "warn" | "muted" | "busy" | "danger";

interface StatusChipProps {
  /** 不传时按 status 取默认文案 */
  children?: ReactNode;
  tone?: ChipTone;
  /** 直接给数据态，文案与配色自动跟随 */
  status?: UiStatus;
}

/** 状态胶囊：订阅卡、设置状态行共用。 */
export function StatusChip({ children, tone, status }: StatusChipProps) {
  const finalTone = tone ?? (status ? STATUS_TONE[status] : "ok");
  const label = children ?? (status ? STATUS_LABEL[status] : null);
  return <span className={`chip ${finalTone}`}>{label}</span>;
}
