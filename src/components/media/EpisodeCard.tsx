import { Focusable } from "../base/Focusable";
import { Placeholder } from "../base/Placeholder";

export type EpisodeState = "default" | "active" | "seen" | "upcoming";

interface EpisodeCardProps {
  index: number;
  /** 分集标题；为空时显示占位条，不伪造剧集名 */
  title?: string | null;
  state?: EpisodeState;
  focusKey?: string;
  onSelect?: () => void;
  /** card：292×232 分集卡；row：订阅页 380×48 分集行 */
  variant?: "card" | "row";
}

const STATE_LABEL: Record<EpisodeState, string> = {
  default: "待观看",
  active: "在看",
  seen: "已看完",
  upcoming: "待播出",
};

/**
 * 画布「分集卡」：292×232，缩略图 164 + 集号行 26 + 标题 22。
 * row 变体用于订阅详情：380×48 单行。
 */
export function EpisodeCard({ index, title, state = "default", focusKey, onSelect, variant = "card" }: EpisodeCardProps) {
  if (variant === "row") {
    return (
      <Focusable
        className={`sep-row st-${state}`}
        focusKey={focusKey}
        ariaLabel={title ?? `第 ${index} 集`}
        disabled={state === "upcoming"}
        onSelect={onSelect}
      >
        <span className="sep-idx">{String(index).padStart(2, "0")}</span>
        <span className="sep-t">第 {index} 集</span>
        <span className="sep-state">{STATE_LABEL[state]}</span>
      </Focusable>
    );
  }

  return (
    <Focusable
      className={`epcard st-${state}`}
      focusKey={focusKey}
      ariaLabel={title ?? `第 ${index} 集`}
      disabled={state === "upcoming"}
      onSelect={onSelect}
    >
      <span className="epcard-art">
        <Placeholder ratio="16:9" />
        {state === "seen" && (
          <span className="epcard-check" aria-label="已看完">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m3.5 8.4 3 3 6-6.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        {state === "active" && <span className="epcard-live">在看</span>}
        {state === "upcoming" && (
          <span className="epcard-lock" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="5" y="10" width="14" height="10" rx="2.5" />
              <path d="M8 10V7.6a4 4 0 0 1 8 0V10" strokeLinecap="round" />
            </svg>
            <span>待播出</span>
          </span>
        )}
      </span>
      <span className="epcard-body">
        <span className="epcard-t">第 {index} 集</span>
        <span className="epcard-dur">48 分钟</span>
      </span>
      {title ? <span className="epcard-title">{title}</span> : <span className="epcard-title-bar" aria-hidden="true" />}
    </Focusable>
  );
}
