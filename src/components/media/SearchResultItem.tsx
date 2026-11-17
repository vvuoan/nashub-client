import { Focusable } from "../base/Focusable";
import { Image } from "../base/Image";
import { Placeholder } from "../base/Placeholder";

interface SearchResultItemProps {
  title: string;
  meta?: string;
  image: string | null;
  badge?: string;
  focusKey?: string;
  onSelect?: () => void;
}

/** 搜索结果行：160×90 缩略图 + 标题 + 元信息。 */
export function SearchResultItem({
  title,
  meta,
  image,
  badge,
  focusKey,
  onSelect,
}: SearchResultItemProps) {
  return (
    <Focusable className="sresult" focusKey={focusKey} ariaLabel={title} onSelect={onSelect}>
      <Image
        src={image}
        alt={title}
        className="thumb"
        placeholder={<Placeholder ratio="16:9" label="缩略图占位" />}
        emptyLabel="暂无图片"
      />
      <span className="body">
        <span className="t">{title}</span>
        {meta && <span className="m">{meta}</span>}
      </span>
      {badge && <span className="badge">{badge}</span>}
    </Focusable>
  );
}
