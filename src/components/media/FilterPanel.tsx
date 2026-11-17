import { useState } from "react";
import { FocusTrap } from "../base/FocusTrap";
import { Focusable } from "../base/Focusable";

export interface FilterGroup {
  label: string;
  options: string[];
}

interface FilterPanelProps {
  open: boolean;
  groups: FilterGroup[];
  onClose: () => void;
}

/**
 * 画布「电影 · 筛选面板」：960×500，圆角 28，带 0/26/64/-8 投影。
 * 类型/国家两组胶囊来自后端返回的可用筛选项；没有就如实写「暂无可筛选项」。
 */
export function FilterPanel({ open, groups, onClose }: FilterPanelProps) {
  const [picked, setPicked] = useState<Record<string, string>>({});

  if (!open) return null;

  const hasOptions = groups.some((group) => group.options.length > 0);

  return (
    <div className="fpanel-mask" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <FocusTrap name="filter" className="fpanel" onClose={onClose}>
        <div className="fpanel-head">
          <h3>筛选</h3>
          <Focusable
            className="fpanel-reset"
            focusKey="filter:reset"
            onSelect={() => setPicked({})}
          >
            重置筛选
          </Focusable>
        </div>
        {groups.map((group, index) => (
          <div className={index ? "fgroup second" : "fgroup"} key={group.label}>
            <h4>{group.label}</h4>
            {group.options.length ? (
              <div className="fchips">
                {group.options.map((option) => (
                  <Focusable
                    key={option}
                    className={picked[group.label] === option ? "fchip on" : "fchip"}
                    focusKey={`filter:${group.label}:${option}`}
                    onSelect={() =>
                      setPicked((current) => ({ ...current, [group.label]: option }))
                    }
                  >
                    {option}
                  </Focusable>
                ))}
              </div>
            ) : (
              <p className="fempty">暂无可筛选项</p>
            )}
          </div>
        ))}
        {!hasOptions && <p className="fpanel-note">后端未返回筛选项，接入后自动出现。</p>}
      </FocusTrap>
    </div>
  );
}
