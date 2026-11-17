import type { LiveChannel } from "../../data/api";
import type { ConnState } from "../../types";
import { Image } from "../base/Image";
import { Placeholder } from "../base/Placeholder";

interface LivePreviewProps {
  channel: LiveChannel | null;
  state: ConnState;
}

/** 中栏：16:9 直播画面（节目信息在右侧信息栏，节目单在底部课程表）。 */
export function LivePreview({ channel, state }: LivePreviewProps) {
  const pending =
    state === "loading" ||
    state === "unreachable" ||
    state === "error" ||
    state === "unauthorized";

  return (
    <section className="live-col live-center" aria-label="频道预览">
      <div className="live-frame">
        <Placeholder ratio="16:9" className="live-frame-ph" label="直播画面占位" />
        <span className="live-frame-badge">直播</span>
        {channel?.logo && !pending && (
          <span className="live-frame-logo">
            <Image
              src={channel.logo}
              alt={`${channel.name} 台标`}
              fit="contain"
              placeholder={<span className="live-frame-logo-ph" />}
            />
          </span>
        )}
        <span className="live-frame-caption">直播画面占位 · 播放器接入后替换</span>
      </div>
    </section>
  );
}
