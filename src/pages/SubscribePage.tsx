import { useCallback, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { FocusScope } from "../components/base/FocusScope";
import { Focusable } from "../components/base/Focusable";
import { MetaField } from "../components/base/MetaField";
import { Placeholder } from "../components/base/Placeholder";
import { PosterImage } from "../components/base/PosterImage";
import { StatusChip } from "../components/base/StatusChip";
import { CardRow } from "../components/media/CardRow";
import { CastCard } from "../components/media/CastCard";
import { CategoryTabs } from "../components/media/CategoryTabs";
import { DownloadCard, type DownloadTask } from "../components/media/DownloadCard";
import { EpisodeCard } from "../components/media/EpisodeCard";
import { MediaCard } from "../components/media/MediaCard";

export type SubscribeView = "list" | "movie" | "tv" | "anime";

interface SubscribePageProps {
  view?: SubscribeView;
  /** 默认展开下载卡（画布「下载卡展开」态） */
  downloadOpen?: boolean;
  onOpen?: () => void;
  onPlay?: () => void;
}

const TAGS = [
  { key: "all", label: "全部" },
  { key: "movie", label: "电影" },
  { key: "tv", label: "电视剧" },
  { key: "anime", label: "番剧" },
];

const LAST_TAB_KEY = TAGS[TAGS.length - 1].key;

const BADGES = [
  { label: "已入库", tone: "ok" as const },
  { label: "下载中", tone: "warn" as const },
  { label: "待播", tone: "muted" as const },
];

const TASKS: DownloadTask[] = [
  { id: "t1", pct: 82 },
  { id: "t2", pct: 46 },
  { id: "t3", pct: 24 },
  { id: "t4", pct: 76 },
  { id: "t5", pct: 12 },
  { id: "t6", pct: 58 },
];

const MOVIE_FIELDS = ["订阅编号", "上映日期", "状态", "原始语言", "出品国家", "外部 ID", "评分", "分辨率", "大小"];
const TV_FIELDS = [...MOVIE_FIELDS, "季集数"];

function Bar({ w, className }: { w: number; className?: string }) {
  return <span className={["dt-bar", className].filter(Boolean).join(" ")} style={{ width: `calc(${w} * var(--u))` }} aria-hidden="true" />;
}

/** 订阅页：列表（含下载卡收起/展开）与详情（电影 / 电视剧 / 番剧）。 */
export function SubscribePage({ view = "list", downloadOpen = false, onOpen, onPlay }: SubscribePageProps) {
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState(downloadOpen);

  const toggle = useCallback(() => setExpanded((current) => !current), []);

  /**
   * 下载卡在画布右上角，几何上永远不是标签/卡片行最近的邻居。
   * 这里按视觉关系补两条显式通道：最后一个标签 → 下载卡，下载卡 ↓ → 卡片首项。
   */
  const onNavKeys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const active = document.activeElement as HTMLElement | null;
    const key = active?.dataset.focusKey;
    if (!key) return;

    if (event.key === "ArrowRight" && key === `tag:${LAST_TAB_KEY}`) {
      const card = document.querySelector<HTMLElement>('[data-focus-key="dl:card"]');
      if (!card) return;
      event.preventDefault();
      event.stopPropagation();
      card.focus();
      return;
    }
    if (event.key === "ArrowLeft" && key === "dl:card") {
      const tab = document.querySelector<HTMLElement>(`[data-focus-key="tag:${LAST_TAB_KEY}"]`);
      if (!tab) return;
      event.preventDefault();
      event.stopPropagation();
      tab.focus();
      return;
    }
    if (event.key === "ArrowDown" && key === "dl:card") {
      const first = document.querySelector<HTMLElement>(".subs-cards [data-nav]");
      if (!first) return;
      event.preventDefault();
      event.stopPropagation();
      first.focus();
    }
  };

  if (view !== "list") return <SubscribeDetail view={view} onPlay={onPlay} />;

  return (
    <FocusScope name="subscribe-list" className="subs" autoFocus onKeyDown={onNavKeys}>
      <CategoryTabs tags={TAGS} active={tab} showFilter={false} onSelect={setTab} onFocusSelect={setTab} onFilter={() => undefined} />
      <div className="subs-dl">
        <DownloadCard tasks={TASKS} expanded={expanded} onToggle={toggle} />
      </div>
      <div className="subs-groups">
        {["今天", "本周"].map((title) => (
          <section className="subs-group" key={title}>
            <h2>{title}</h2>
            <div className="subs-cards">
              {Array.from({ length: 7 }, (_, index) => (
                <MediaCard
                  key={`${title}-${index}`}
                  data={null}
                  badge={BADGES[index % BADGES.length]}
                  focusKey={`subs:${title}:${index}`}
                  onSelect={onOpen}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </FocusScope>
  );
}

/* ---------------- 订阅详情 ---------------- */

function SubscribeDetail({ view, onPlay }: { view: Exclude<SubscribeView, "list">; onPlay?: () => void }) {
  const episodic = view !== "movie";
  const [season, setSeason] = useState("1");
  const [subscribed, setSubscribed] = useState(true);

  return (
    <FocusScope name={`subscribe-${view}`} className={`subs-detail sd-${view}`} autoFocus>
      <span className="subs-banner">
        <Placeholder ratio="5.4:1" className="ph-banner" label="订阅横幅占位" />
      </span>
      <span className="subs-banner-dim" aria-hidden="true" />

      <div className="subs-content">
        <div className="subs-head">
          <span className="subs-poster">
            <PosterImage src={null} alt="海报占位" />
          </span>
          <div className="subs-info">
            <Bar w={231} className="eyebrow" />
            <span className="subs-title-ph" aria-hidden="true" />
            <Bar w={408} className="meta" />
            <div className="subs-status">
              <StatusChip tone={subscribed ? "ok" : "muted"}>{subscribed ? "已订阅" : "未订阅"}</StatusChip>
              <Bar w={456} className="status-note" />
            </div>
            <Bar w={episodic ? 640 : 940} className="desc" />
            <div className="subs-actions">
              <Focusable className="dbtn primary" focusKey="subs:play" onSelect={() => onPlay?.()}>
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M7 4.5v11l9-5.5z" fill="currentColor" />
                </svg>
                播放
              </Focusable>
              <Focusable
                className="dbtn ghost"
                focusKey="subs:cancel"
                onSelect={() => setSubscribed((current) => !current)}
              >
                {subscribed ? "取消订阅" : "重新订阅"}
              </Focusable>
              <Focusable className="dbtn ghost wide" focusKey="subs:subtitle" onSelect={() => undefined}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" />
                  <path d="M5.5 11.5h4M11 11.5h3.5" strokeLinecap="round" />
                </svg>
                字幕
              </Focusable>
            </div>
          </div>
        </div>

        {episodic ? (
          <>
            {/* 画布 8:119 / 8:153：右侧资料卡 620×560 @1300,356 */}
            <aside className="subs-profile">
              <h3>演职人员</h3>
              <div className="cast-row profile-cast">
                {Array.from({ length: 5 }, (_, index) => (
                  <CastCard key={index} focusKey={`pcast:${index}`} />
                ))}
              </div>
              <span className="profile-hr" aria-hidden="true" />
              <h3>影片信息</h3>
              <div className="meta-grid profile-meta">
                {TV_FIELDS.map((label) => (
                  <MetaField key={label} label={label} />
                ))}
              </div>
            </aside>

            <section className="subs-episodes">
              <div className="subs-season-tabs">
                {["1", "2", "3"].map((key) => (
                  <Focusable
                    key={key}
                    className={key === season ? "dtab on" : "dtab"}
                    focusKey={`subs:season:${key}`}
                    onSelect={() => setSeason(key)}
                  >
                    第 {key} 季
                  </Focusable>
                ))}
              </div>
              <h2>分集</h2>
              <div className="sepgrid">
                {Array.from({ length: 8 }, (_, index) => (
                  <EpisodeCard
                    key={index}
                    variant="row"
                    index={index + 1}
                    state={index < 5 ? "seen" : index < 6 ? "active" : "default"}
                    focusKey={`subs:ep:${index}`}
                    onSelect={() => onPlay?.()}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="subs-cast">
              <h2>演职人员</h2>
              <div className="cast-row">
                {Array.from({ length: 6 }, (_, index) => (
                  <CastCard key={index} focusKey={`cast:${index}`} />
                ))}
              </div>
            </section>

            <section className="subs-meta">
              <h2>影片信息</h2>
              <div className="meta-grid">
                {MOVIE_FIELDS.map((label) => (
                  <MetaField key={label} label={label} />
                ))}
              </div>
            </section>

            <div className="subs-related">
              <CardRow row={{ title: "相关订阅", items: [] }} fill={7} />
            </div>
          </>
        )}
      </div>
    </FocusScope>
  );
}
