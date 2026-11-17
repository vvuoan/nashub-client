import { FocusScope } from "../components/base/FocusScope";
import { ConnectionNotice } from "../components/media/ConnectionNotice";
import { LiveChannelList } from "../components/media/LiveChannelList";
import { LiveGuide } from "../components/media/LiveGuide";
import { LiveNowPanel } from "../components/media/LiveNowPanel";
import { LivePreview } from "../components/media/LivePreview";
import { useLivePage, type LivePreviewMode } from "../hooks/useLivePage";

interface LivePageProps {
  /** 开发预览：preview 有占位数据，empty / loading 用于核对空态与骨架 */
  preview?: LivePreviewMode;
}

/**
 * 直播页：上方频道列表 / 直播画面 / 正在播信息（396 / 980 / 400），底部整幅课程表节目单。
 * 页面只组合频道列表、预览、信息栏、节目单，取数、焦点、图片加载分别由 hook 与基础组件承担。
 */
export function LivePage({ preview }: LivePageProps) {
  const live = useLivePage(preview);
  const current =
    live.epg?.current ??
    (live.selectedId ? (live.currentById[live.selectedId] ?? null) : null);
  const next = live.epg?.upcoming[0] ?? null;
  const note =
    preview === "empty"
      ? "空状态 · 该分组没有频道"
      : preview === "loading"
        ? "加载状态 · 等待频道与节目单"
        : preview === "preview"
          ? "预览占位 · 上方 396 / 980 / 400 · 底部课程表"
          : `直播源与节目单来自 live-tv 插件${live.channels.length ? ` · ${live.channels.length} 个频道` : ""}`;

  return (
    <FocusScope name="live" className="live-page" autoFocus>
      <header className="live-head">
        <h1>直播</h1>
        <p>{note}</p>
      </header>

      {!preview && (
        <ConnectionNotice state={live.state} message={live.message} onRetry={live.reload} />
      )}

      <div className="live-grid">
        <LiveChannelList
          groups={live.groups}
          group={live.group}
          channels={live.channels}
          selectedId={live.selectedId}
          currentById={live.currentById}
          state={live.state}
          onGroup={live.selectGroup}
          onSelect={live.selectChannel}
        />
        <LivePreview channel={live.selected} state={live.state} />
        <LiveNowPanel
          channel={live.selected}
          current={current}
          next={next}
          state={live.state}
        />
        <LiveGuide
          channels={live.channels}
          selectedId={live.selectedId}
          board={live.epgBoard}
          state={live.state}
          onLoad={live.loadEpg}
        />
      </div>
    </FocusScope>
  );
}
