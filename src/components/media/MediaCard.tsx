import type { MediaCardData } from "../../types";
import { Focusable } from "../base/Focusable";
import { Image } from "../base/Image";
import { Placeholder } from "../base/Placeholder";
import { PosterImage } from "../base/PosterImage";

interface MediaCardProps {
  /** 为空时渲染中性占位卡，结构不变 */
  data: MediaCardData | null;
  /** info：卡片信息层（评分、片名在下方）；poster：片名压在图上 */
  variant?: "info" | "poster";
  focusKey?: string;
  /** 业务状态胶囊（订阅、下载等），只承载状态不承载影视信息 */
  badge?: { label: string; tone?: "ok" | "warn" | "muted" } | null;
  onSelect?: () => void;
  onFocus?: () => void;
}

/**
 * 画布「卡片 · Poster 2:3 / 卡片信息层」：200×300 封面。
 * 无数据时只显示占位图与占位文字条，不出现任何片名/评分。
 */
export function MediaCard({ data, variant = "info", focusKey, badge, onSelect, onFocus }: MediaCardProps) {
  const key = focusKey ?? (data ? `card:${data.id}` : undefined);
  const art = data?.poster ? (
    <PosterImage src={data.poster} alt={data.title} className="mcard-art" />
  ) : (
    <span className="mcard-art">
      <Placeholder ratio="2:3" />
    </span>
  );

  if (variant === "poster") {
    return (
      <Focusable
        className={data ? "mcard poster-only" : "mcard poster-only is-ph"}
        focusKey={key}
        ariaLabel={data?.title ?? "占位卡片"}
        onSelect={onSelect}
        onFocus={onFocus}
      >
        {art}
        {data && (
          <span className="mcard-on">
            <span className="mcard-t">{data.title}</span>
            {data.meta && <span className="mcard-m">{data.meta}</span>}
          </span>
        )}
      </Focusable>
    );
  }

  return (
    <Focusable
      className={data ? "mcard" : "mcard is-ph"}
      focusKey={key}
      ariaLabel={data?.title ?? "占位卡片"}
      onSelect={onSelect}
      onFocus={onFocus}
    >
      <span className="mcard-art">
        <Image
          src={data?.poster ?? null}
          alt={data?.title ?? "占位图"}
          placeholder={<Placeholder ratio="2:3" />}
        />
        {data?.rating !== null && data?.rating !== undefined && (
          <span className="mcard-rate">{data.rating.toFixed(1)}</span>
        )}
        {data?.local && (
          <span className="mcard-local" aria-label="本地库">
            库
          </span>
        )}
        {badge && <span className={`mcard-badge ${badge.tone ?? "muted"}`}>{badge.label}</span>}
      </span>
      {data ? (
        <>
          <span className="mcard-t">{data.title}</span>
          {data.meta && <span className="mcard-m">{data.meta}</span>}
        </>
      ) : (
        <>
          <span className="mcard-bar w1" aria-hidden="true" />
          <span className="mcard-bar w2" aria-hidden="true" />
        </>
      )}
    </Focusable>
  );
}
