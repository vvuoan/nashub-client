import { useEffect, useState } from "react";
import { FocusScope } from "../components/base/FocusScope";
import { Focusable } from "../components/base/Focusable";
import { PlayerControls } from "../components/media/PlayerControls";
import { SubtitleMenu } from "../components/media/SubtitleMenu";
import { TrackMenu } from "../components/media/TrackMenu";

interface PlayerPageProps {
  onBack?: () => void;
}

/**
 * 播放页：16:9 中性画面占位 + 顶部信息条 + 底部控制条 + 音轨/字幕弹层。
 * 不播放任何真实媒体，不出现片名与剧集信息。
 */
export function PlayerPage({ onBack }: PlayerPageProps) {
  const [paused, setPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [tracksOpen, setTracksOpen] = useState(false);
  const [subsOpen, setSubsOpen] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-focus-key="pc:toggle"]')?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <FocusScope name="player" className="player" autoFocus={false}>
      <span className="player-video" aria-hidden="true">
        <span className="player-video-glow" />
        <span className="player-center">
          <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
            <path d="M18 12v24l20-12z" />
          </svg>
        </span>
      </span>
      <span className="player-dim" aria-hidden="true" />

      <header className="player-head">
        <Focusable className="pbtn" focusKey="player:back" ariaLabel="返回" onSelect={() => onBack?.()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m14.5 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Focusable>
        <span className="player-titles">
          <span className="player-title-bar" aria-hidden="true" />
          <span className="player-sub-bar" aria-hidden="true" />
        </span>
        <span className="player-status">{paused ? "已暂停" : "正在播放"}</span>
      </header>

      <div className="player-controls">
        <PlayerControls
          paused={paused}
          position={position}
          duration={Number.NaN}
          onToggle={() => setPaused((current) => !current)}
          onSeek={setPosition}
          onBack={() => onBack?.()}
          onOpenTracks={() => setTracksOpen(true)}
          onOpenSubtitles={() => setSubsOpen(true)}
        />
      </div>

      <TrackMenu
        open={tracksOpen}
        title="音轨"
        name="player-audio"
        options={[
          { id: "a", label: "音轨 1", detail: "默认" },
          { id: "b", label: "音轨 2" },
        ]}
        selectedId="a"
        onSelect={() => setTracksOpen(false)}
        onClose={() => setTracksOpen(false)}
      />
      <SubtitleMenu
        open={subsOpen}
        options={[{ id: "s1", label: "字幕 1" }]}
        onSelect={() => setSubsOpen(false)}
        onClose={() => setSubsOpen(false)}
      />
    </FocusScope>
  );
}
