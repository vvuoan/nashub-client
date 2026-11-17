import type { LiveChannel, LiveGroupCount, LiveProgramme } from "../../data/api";
import type { ConnState } from "../../types";
import { Focusable } from "../base/Focusable";
import { Image } from "../base/Image";
import { Placeholder } from "../base/Placeholder";

interface LiveChannelListProps {
  groups: LiveGroupCount[];
  group: string;
  channels: LiveChannel[];
  selectedId: string | null;
  currentById: Record<string, LiveProgramme | null>;
  state: ConnState;
  onGroup: (group: string) => void;
  onSelect: (channelId: string) => void;
}

/** 左栏：分组页签 + 频道行（台标 48、名称 23/600、当前节目 21/400）。 */
export function LiveChannelList({
  groups,
  group,
  channels,
  selectedId,
  currentById,
  state,
  onGroup,
  onSelect,
}: LiveChannelListProps) {
  const pending = state === "loading" || state === "unreachable" || state === "error" || state === "unauthorized";

  return (
    <section className="live-col live-channels" aria-label="频道列表">
      <div className="live-groupbar" role="tablist" aria-label="直播分组">
        {groups.map((item) => (
          <Focusable
            key={item.group}
            className={item.group === group ? "live-group on" : "live-group"}
            focusKey={`live:g:${item.group}`}
            ariaLabel={`${item.label} ${item.count} 个频道`}
            // 与导航栏/设置分组一致：焦点到位即切换，不再要求按确认
            onFocus={() => {
              if (item.group !== group) onGroup(item.group);
            }}
            onSelect={() => onGroup(item.group)}
          >
            <span>{item.label}</span>
            {item.count > 0 && <span className="n">{item.count}</span>}
          </Focusable>
        ))}
      </div>

      <div className="live-ch-list">
        {pending &&
          Array.from({ length: 9 }, (_, i) => (
            <div className="live-ch is-ph" key={`ch-ph-${i}`} aria-hidden="true">
              <span className="live-logo-sk live-line" />
              <span className="live-ch-text">
                <span className="live-line w-120" />
                <span className="live-line w-160 dim" />
              </span>
            </div>
          ))}

        {!pending && state === "empty" && (
          <div className="live-empty-inline">
            <p>这个分类还没有频道</p>
            <span>换一个分组，或在设置「来源」里刷新直播源</span>
          </div>
        )}

        {!pending &&
          state === "ok" &&
          channels.map((item) => {
            const current = currentById[item.channelId];
            return (
              <Focusable
                key={item.channelId}
                className={item.channelId === selectedId ? "live-ch on" : "live-ch"}
                focusKey={`live:ch:${item.channelId}`}
                ariaLabel={`${item.name} ${current?.title ?? "暂无节目单"}`}
                onSelect={() => onSelect(item.channelId)}
              >
                <span className="live-logo">
                  <Image
                    src={item.logo}
                    alt={`${item.name} 台标`}
                    fit="contain"
                    placeholder={<Placeholder ratio="1:1" className="live-logo-ph" label="台标占位" />}
                  />
                </span>
                <span className="live-ch-text">
                  <span className="nm">{item.name}</span>
                  <span className="cur">{current?.title ?? "暂无节目单"}</span>
                </span>
              </Focusable>
            );
          })}
      </div>
    </section>
  );
}
