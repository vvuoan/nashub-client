import { Focusable } from "../base/Focusable";
import { ProgressBar } from "../base/ProgressBar";

interface PlayerControlsProps {
  paused: boolean;
  position: number;
  duration: number;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
  onBack: () => void;
  onOpenTracks: () => void;
  onOpenSubtitles: () => void;
}

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

/** 播放控制条：纯展示 + 回调，不持有播放器实例。 */
export function PlayerControls({
  paused,
  position,
  duration,
  onToggle,
  onSeek,
  onBack,
  onOpenTracks,
  onOpenSubtitles,
}: PlayerControlsProps) {
  const pct = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div className="pcontrols">
      <Focusable className="pbtn" focusKey="pc:back" ariaLabel="返回" onSelect={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m14.5 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Focusable>
      <Focusable
        className="pbtn"
        focusKey="pc:toggle"
        ariaLabel={paused ? "播放" : "暂停"}
        onSelect={onToggle}
      >
        {paused ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z" />
          </svg>
        )}
      </Focusable>
      <span className="time">{clock(position)}</span>
      <Focusable
        className="pseek"
        focusKey="pc:seek"
        ariaLabel="播放进度"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.stopPropagation();
            onSeek(Math.max(0, position - 10));
          } else if (event.key === "ArrowRight") {
            event.stopPropagation();
            onSeek(Math.min(duration || position, position + 10));
          }
        }}
      >
        <ProgressBar value={pct} label="播放进度" />
      </Focusable>
      <span className="time">{clock(duration)}</span>
      <Focusable className="pbtn" focusKey="pc:subs" ariaLabel="字幕" onSelect={onOpenSubtitles}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M6.5 14h4M12.5 14h5" strokeLinecap="round" />
        </svg>
      </Focusable>
      <Focusable className="pbtn" focusKey="pc:tracks" ariaLabel="音轨" onSelect={onOpenTracks}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 14v-2a8 8 0 0 1 16 0v2" strokeLinecap="round" />
          <rect x="3" y="13" width="4" height="7" rx="2" />
          <rect x="17" y="13" width="4" height="7" rx="2" />
        </svg>
      </Focusable>
    </div>
  );
}
