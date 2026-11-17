import { backdropUrl } from "../../data/api";
import type { ContinueItem } from "../../types";
import { Focusable } from "../base/Focusable";
import { Image } from "../base/Image";
import { Placeholder } from "../base/Placeholder";
import { ProgressBar } from "../base/ProgressBar";

interface ContinueWatchingRowProps {
  open: boolean;
  items: ContinueItem[];
}

/** 无数据时铺满的占位卡数量（按画布展开态可视宽度） */
const FILL = 4;

/**
 * 画布「继续观看 · 展开态」：320×180 卡片，标题 20px，进度条 288×4。
 * 无数据时用 16:9 中性占位卡铺满，接真实数据时结构不变。
 */
export function ContinueWatchingRow({ open, items }: ContinueWatchingRowProps) {
  const cards = items.length
    ? items.map((item) => (
        <Focusable
          key={item.id}
          className="ccard"
          focusKey={`cont:${item.id}`}
          ariaLabel={`继续观看 ${item.title}，${item.pct}%`}
        >
          <Image
            src={backdropUrl(item.id)}
            alt={item.title}
            className="ccard-bg"
            placeholder={<Placeholder ratio="16:9" className="ccard-bg" label="剧照占位" />}
            emptyLabel="暂无剧照"
          />
          <span className="pl">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="tit">{item.title}</span>
          <ProgressBar value={item.pct} className="bar" label="观看进度" />
        </Focusable>
      ))
    : Array.from({ length: FILL }, (_, index) => (
        <Focusable
          key={`ph-${index}`}
          className="ccard is-ph"
          focusKey={`cont-ph:${index}`}
          ariaLabel="继续观看占位"
        >
          <Placeholder ratio="16:9" className="ccard-bg" label="剧照占位" />
          <span className="ccard-bar" aria-hidden="true" />
          <span className="ccard-bar s" aria-hidden="true" />
          <span className="bar" aria-hidden="true" />
        </Focusable>
      ));

  return (
    <section className={open ? "cont open" : "cont"} aria-hidden={!open}>
      <h2 className="cont-h">继续观看</h2>
      <div className="ccards">{cards}</div>
    </section>
  );
}
