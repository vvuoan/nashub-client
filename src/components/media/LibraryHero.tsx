import type { MediaCardData } from "../../types";
import { Focusable } from "../base/Focusable";
import { Image } from "../base/Image";
import { Placeholder } from "../base/Placeholder";

interface LibraryHeroProps {
  hero: MediaCardData | null;
  /** hero：1920×1080 首屏；list：560 高的缩小态 */
  mode: "hero" | "list";
  loading: boolean;
  onPlay: () => void;
  onDetail: () => void;
}

/**
 * 画布「影视 · 首屏 / 列表态」主视觉：
 * 片名 76 光（缩小态 40）、元信息、简介、播放/详情按钮。
 * 没有数据时用中性占位背景与文字条保持版面完整，不出现任何影视信息。
 */
export function LibraryHero({ hero, mode, loading, onPlay, onDetail }: LibraryHeroProps) {
  const neutral = !hero;

  return (
    <section className={mode === "hero" ? "lhero" : "lhero shrink"}>
      <Image
        src={hero?.poster ?? null}
        alt={hero?.title ?? "主视觉占位"}
        className="lhero-bg"
        placeholder={<Placeholder ratio="16:9" className="ph-hero" label="主视觉占位" />}
      />
      <span className="lhero-dim" aria-hidden="true" />
      <div className="lhero-body">
        <span className={mode === "hero" ? "lhero-eyebrow" : "lhero-eyebrow small"} aria-hidden="true" />
        {neutral || loading ? (
          <>
            <span className={mode === "hero" ? "lhero-bar t" : "lhero-bar t small"} aria-hidden="true" />
            <span className={mode === "hero" ? "lhero-bar m" : "lhero-bar m small"} aria-hidden="true" />
            <span className={mode === "hero" ? "lhero-bar d" : "lhero-bar d small"} aria-hidden="true" />
          </>
        ) : (
          <>
            <h1 className="lhero-title">{hero.title}</h1>
            <p className="lhero-meta">{hero.meta ?? "—"}</p>
            <p className="lhero-desc">简介暂未提供</p>
          </>
        )}
        {mode === "hero" && (
          <div className="lhero-actions">
            <Focusable
              className="lbtn primary"
              focusKey="hero:play"
              onSelect={onPlay}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M7 4.5v11l9-5.5z" fill="currentColor" />
              </svg>
              播放
            </Focusable>
            <Focusable
              className="lbtn ghost"
              focusKey="hero:detail"
              onSelect={onDetail}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 9v5M10 6.6v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              详情
            </Focusable>
          </div>
        )}
      </div>
    </section>
  );
}
