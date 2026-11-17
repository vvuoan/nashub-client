import type { MediaCardData, MediaRowData } from "../../types";
import { Focusable } from "../base/Focusable";
import { MediaCard } from "./MediaCard";

interface CardRowProps {
  row: MediaRowData;
  /** 骨架卡数量；>0 时显示加载占位而不是内容 */
  skeleton?: number;
  /** 无数据时铺满卡位的数量；0 表示不铺，显示空态文案 */
  fill?: number;
  showTitle?: boolean;
  onSelect?: (id: string) => void;
  /** 有真实数据时把整张卡片回传，用于进入详情 */
  onCard?: (item: MediaCardData) => void;
  /** 占位卡被确认时进入占位详情，版面与真实详情一致 */
  onEmpty?: () => void;
  /** 焦点接近行尾时预取下一页；不传则本行不再往后追加 */
  onMore?: () => void;
}

/** 焦点进到最后两张卡时触发下一页，保证往右能一直翻下去。 */
const MORE_EDGE = 2;

/** 一行卡片：标题 30/90% + 200×300 卡片，间距 24；无数据用中性占位卡铺满。 */
export function CardRow({ row, skeleton = 0, fill = 7, showTitle = true, onSelect, onCard, onEmpty, onMore }: CardRowProps) {
  const cards = skeleton
    ? Array.from({ length: skeleton }, (_, index) => (
        <span key={`sk-${index}`} className="card-skel" aria-hidden="true" />
      ))
    : row.items.length
      ? row.items.map((item, index) => (
          <MediaCard
            key={item.id}
            data={item}
            onFocus={index >= row.items.length - MORE_EDGE ? onMore : undefined}
            onSelect={() => {
              onCard?.(item);
              onSelect?.(item.id);
            }}
          />
        ))
      : Array.from({ length: fill }, (_, index) => (
          <MediaCard
            key={`ph-${index}`}
            data={null}
            focusKey={`ph:${row.title}:${index}`}
            onSelect={onEmpty}
          />
        ));

  // 画布中电影/剧/动漫首屏无行标题；空态也不补标题，否则首卡会下移。
  const titled = showTitle;

  return (
    <section className={titled ? "crow titled" : "crow"}>
      {titled && <h2 className="crow-t">{row.title}</h2>}
      {!skeleton && !row.items.length && fill === 0 ? (
        <Focusable className="crow-empty" focusKey={`row:${row.title}`} ariaLabel={`${row.title}：暂无内容`}>
          暂无内容
        </Focusable>
      ) : (
        <div className="crow-cards">{cards}</div>
      )}
    </section>
  );
}
