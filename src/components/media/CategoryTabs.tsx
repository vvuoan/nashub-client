import type { TagFilter } from "../../types";
import { Focusable } from "../base/Focusable";

interface CategoryTabsProps {
  tags: TagFilter[];
  active: string | null;
  showFilter: boolean;
  onSelect: (key: string) => void;
  /** 焦点移到标签即切换（分类这类「层级切换」不再要求确认键） */
  onFocusSelect?: (key: string) => void;
  onFilter: () => void;
  /** 无 tag 数据时保留的标签骨架数量（按画布 3–5 颗），不伪造文案 */
  skeletonCount?: number;
}

/**
 * 画布「分类标签 · 选中 / 默认」+「筛选入口」：
 * 148×56、圆角 28、选中白底深字；筛选入口 152×56 带下拉箭头。
 */
export function CategoryTabs({ tags, active, showFilter, onSelect, onFocusSelect, onFilter, skeletonCount = 0 }: CategoryTabsProps) {
  return (
    <div className="ctabs">
      {tags.length === 0 && skeletonCount > 0
        ? Array.from({ length: skeletonCount }, (_, index) => (
            <span className="ctab is-ph" key={`tab-ph-${index}`} aria-hidden="true">
              <i />
            </span>
          ))
        : tags.map((tag) => (
            <Focusable
              key={tag.key}
              className={tag.key === active ? "ctab on" : "ctab"}
              focusKey={`tag:${tag.key}`}
              onFocus={() => onFocusSelect?.(tag.key)}
              onSelect={() => onSelect(tag.key)}
            >
              {tag.label}
            </Focusable>
          ))}
      {showFilter && (
        <Focusable className="ctab filter" focusKey="tag:filter" ariaLabel="筛选" onSelect={onFilter}>
          筛选
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M2.6 5.2 7 9.6l4.4-4.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Focusable>
      )}
    </div>
  );
}
