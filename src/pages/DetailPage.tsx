import { useEffect, useState } from "react";
import { FocusScope } from "../components/base/FocusScope";
import { Focusable } from "../components/base/Focusable";
import { Image } from "../components/base/Image";
import { Placeholder } from "../components/base/Placeholder";
import { PosterImage } from "../components/base/PosterImage";
import { ProgressBar } from "../components/base/ProgressBar";
import { CardRow } from "../components/media/CardRow";
import { EpisodeCard, type EpisodeState } from "../components/media/EpisodeCard";
import { SourceMenu, type SourceOption } from "../components/media/SourceMenu";
import type { MediaCardData } from "../types";

/** 画布「详情」七态：电影 / 电视剧 / 番剧 / 未看 / 已看完 / 仅在线 / 播放源展开。 */
export type DetailVariant = "movie" | "tv" | "anime" | "unseen" | "watched" | "online" | "sources";

interface DetailPageProps {
  variant?: DetailVariant;
  /** 真实卡片数据；为空时所有内容回落到中性占位，结构不变 */
  card?: MediaCardData | null;
  onPlay?: () => void;
}

const EPISODIC: DetailVariant[] = ["tv", "anime"];

const PROGRESS: Record<DetailVariant, number> = {
  movie: 42,
  tv: 62,
  anime: 38,
  unseen: 0,
  watched: 100,
  online: 42,
  sources: 42,
};

const PLAY_LABEL: Record<DetailVariant, string> = {
  movie: "继续观看",
  tv: "继续观看",
  anime: "继续观看",
  unseen: "播放",
  watched: "重新播放",
  online: "播放",
  sources: "播放",
};

const EPISODE_STATES: Record<"tv" | "anime", EpisodeState[]> = {
  tv: ["seen", "seen", "seen", "seen", "active", "default", "default", "default"],
  anime: ["seen", "seen", "seen", "seen", "seen", "seen", "upcoming", "upcoming"],
};

const SOURCES: SourceOption[] = [
  { id: "a", label: "播放源 1", detail: "待接入" },
  { id: "b", label: "播放源 2", detail: "待接入" },
  { id: "c", label: "播放源 3", detail: "待接入" },
];

const FILE_FIELDS = ["分辨率", "音频", "字幕", "大小"];
const ONLINE_FIELDS = ["来源站点", "清晰度", "音轨", "字幕"];

function Bar({ w, className }: { w: number; className?: string }) {
  return <span className={["dt-bar", className].filter(Boolean).join(" ")} style={{ width: `calc(${w} * var(--u))` }} aria-hidden="true" />;
}

/**
 * 详情页：七种状态共用一个结构。
 * 标题、评分、简介、集数等全部来自 props，没有数据时只用中性色条占位。
 */
export function DetailPage({ variant = "movie", card = null, onPlay }: DetailPageProps) {
  const episodic = EPISODIC.includes(variant);
  const [favorite, setFavorite] = useState(variant === "watched");
  const [sourceOpen, setSourceOpen] = useState(variant === "sources");
  const [source, setSource] = useState("a");
  const [season, setSeason] = useState("1");

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-focus-key="detail:play"]')?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const played = variant === "watched";
  const progress = PROGRESS[variant];
  const fields = variant === "online" ? ONLINE_FIELDS : FILE_FIELDS;
  const states = episodic ? EPISODE_STATES[variant as "tv" | "anime"] : [];

  return (
    <FocusScope name={`detail-${variant}`} className={`detail dv-${variant}`} autoFocus>
      <Image
        src={card?.poster ?? null}
        alt={card?.title ?? "详情背景占位"}
        className="detail-bg"
        placeholder={<Placeholder ratio="16:9" className="ph-detail" label="详情背景占位" />}
      />
      <span className="detail-dim" aria-hidden="true" />
      <span className="detail-dim-left" aria-hidden="true" />
      <span className="detail-dim-bottom" aria-hidden="true" />

      <div className="detail-head">
        <span className="detail-poster">
          <PosterImage src={card?.poster ?? null} alt={card?.title ?? "海报占位"} />
        </span>
        <div className="detail-info">
          <span className="detail-eyebrow" aria-hidden="true" />
          {card?.title ? (
            <h1 className="detail-title">{card.title}</h1>
          ) : (
            <span className="detail-title-ph" aria-hidden="true" />
          )}
          {card?.meta ? <p className="detail-meta">{card.meta}</p> : <Bar w={428} className="meta" />}
          <Bar w={320} className="tags" />
          <Bar w={860} className="desc" />

          {variant !== "unseen" && (
            <div className="detail-progress">
              <ProgressBar value={progress} label="观看进度" />
              <Bar w={variant === "tv" || variant === "anime" ? 315 : 300} className="progress-text" />
            </div>
          )}

          <div className="detail-actions">
            <Focusable className="dbtn primary" focusKey="detail:play" onSelect={() => onPlay?.()}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M7 4.5v11l9-5.5z" fill="currentColor" />
              </svg>
              {played ? "重新播放" : PLAY_LABEL[variant]}
            </Focusable>
            <Focusable
              className={favorite ? "dbtn ghost fav on" : "dbtn ghost fav"}
              focusKey="detail:fav"
              ariaLabel={favorite ? "取消收藏" : "收藏"}
              onSelect={() => setFavorite((current) => !current)}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M10 16.5S3.5 12.3 3.5 8.1A3.6 3.6 0 0 1 10 6a3.6 3.6 0 0 1 6.5 2.1c0 4.2-6.5 8.4-6.5 8.4Z" />
              </svg>
              {favorite ? "已收藏" : "收藏"}
            </Focusable>
            <Focusable
              className="dbtn ghost source"
              focusKey="detail:source"
              ariaLabel="播放源"
              onSelect={() => setSourceOpen(true)}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <ellipse cx="10" cy="5.5" rx="6.5" ry="2.5" />
                <path d="M3.5 5.5v9c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-9" strokeLinecap="round" />
                <path d="M3.5 10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5" strokeLinecap="round" />
              </svg>
              播放源
            </Focusable>
            <Focusable className="dbtn more" focusKey="detail:more" ariaLabel="更多" onSelect={() => undefined}>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <circle cx="4.5" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="15.5" cy="10" r="1.5" />
              </svg>
            </Focusable>
          </div>
        </div>
      </div>

      {episodic && (
        <div className="detail-tabs">
          {["1", "2", "3"].map((key) => (
            <Focusable
              key={key}
              className={key === season ? "dtab on" : "dtab"}
              focusKey={`detail:season:${key}`}
              onFocus={() => {
                if (key !== season) setSeason(key);
              }}
              onSelect={() => setSeason(key)}
            >
              第 {key} 季
            </Focusable>
          ))}
          <Bar w={212} className="season-note" />
        </div>
      )}

      <div className={episodic ? "detail-body episodic" : "detail-body"}>
        {episodic ? (
          <>
            <div className="epgrid">
              {Array.from({ length: 8 }, (_, index) => (
                <EpisodeCard
                  key={index}
                  index={index + 1}
                  state={states[index] ?? "default"}
                  focusKey={`detail:ep:${index}`}
                  onSelect={() => onPlay?.()}
                />
              ))}
            </div>
            <div className="detail-related">
              <CardRow row={{ title: "相似推荐", items: [] }} fill={7} />
            </div>
          </>
        ) : (
          <>
            <section className="detail-files">
              <h2>{variant === "online" ? "来源" : "文件信息"}</h2>
              <div className="detail-file-grid">
                {fields.map((label) => (
                  <div className="detail-file" key={label}>
                    <span className="k">{label}</span>
                    <Bar w={160} className="v" />
                  </div>
                ))}
              </div>
            </section>
            <div className="detail-related">
              <CardRow row={{ title: "相似推荐", items: [] }} fill={7} />
            </div>
          </>
        )}
      </div>

      <SourceMenu
        open={sourceOpen}
        options={SOURCES}
        selectedId={source}
        onSelect={(id) => {
          setSource(id);
          setSourceOpen(false);
          window.requestAnimationFrame(() =>
            document.querySelector<HTMLElement>('[data-focus-key="detail:source"]')?.focus(),
          );
        }}
        onClose={() => {
          setSourceOpen(false);
          window.requestAnimationFrame(() =>
            document.querySelector<HTMLElement>('[data-focus-key="detail:source"]')?.focus(),
          );
        }}
      />
    </FocusScope>
  );
}
