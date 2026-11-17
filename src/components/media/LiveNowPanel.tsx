import type { LiveChannel, LiveProgramme } from "../../data/api";
import type { ConnState } from "../../types";
import { Skeleton } from "../base/Skeleton";

interface LiveNowPanelProps {
  channel: LiveChannel | null;
  current: LiveProgramme | null;
  next: LiveProgramme | null;
  state: ConnState;
}

function timeOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--:--";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** 右栏：选中频道的正在播信息（画面右侧，节目单在页面底部）。 */
export function LiveNowPanel({ channel, current, next, state }: LiveNowPanelProps) {
  const pending =
    state === "loading" ||
    state === "unreachable" ||
    state === "error" ||
    state === "unauthorized";

  return (
    <section className="live-col live-info" aria-label="正在播">
      <p className="live-info-kicker">
        <span className="dot" />
        正在直播
      </p>

      {pending ? (
        <div className="live-now">
          <Skeleton className="live-line title" />
          <Skeleton className="live-line w-320 dim" />
          <Skeleton className="live-line w-200 dim" />
        </div>
      ) : (
        <div className="live-now">
          <h2>{channel?.name ?? "未选择频道"}</h2>
          <p className="live-prog">{current?.title ?? "暂无节目单"}</p>
          <p className="live-time">
            {current ? `${timeOf(current.startAt)} – ${timeOf(current.stopAt)}` : "—"}
          </p>
        </div>
      )}

      <div className="live-rows">
        <div className="live-nrow">
          <span className="k">正在播</span>
          <span className="v">{current?.title ?? "暂无节目单"}</span>
        </div>
        <div className="live-nrow">
          <span className="k">下一档</span>
          <span className="v">{next?.title ?? "暂无节目单"}</span>
        </div>
      </div>

      <p className="live-hint">↑↓ 换台 · OK 播放 · ←→ 切分组 · 返回退出直播</p>
    </section>
  );
}
