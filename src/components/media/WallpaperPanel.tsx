import type { WallSource } from "../../types";
import { FocusTrap } from "../base/FocusTrap";
import { Focusable } from "../base/Focusable";
import { Image } from "../base/Image";

interface WallpaperPanelProps {
  open: boolean;
  source: WallSource;
  thumbs: string[];
  current: number;
  onSource: (source: WallSource) => void;
  onPick: (index: number) => void;
  onClose: () => void;
}

function noteFor(source: WallSource, count: number): string {
  if (source === "recent") {
    return `最近观看剧照 · ${count} 张`;
  }
  return count > 0 ? "纯黑 · 不用图片" : "后端未连接或没有剧照，当前只有纯黑可用";
}

/** 画布「壁纸面板 · 展开态」：720 宽右侧面板。 */
export function WallpaperPanel({
  open,
  source,
  thumbs,
  current,
  onSource,
  onPick,
  onClose,
}: WallpaperPanelProps) {
  const hasStills = thumbs.length > 0;

  return (
    <div
      className={open ? "sheet open" : "sheet"}
      aria-hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <FocusTrap name="wallpaper" className="panel-host" onClose={onClose}>
          <div className="panel">
            <h3>壁纸</h3>
            <div className="srcs">
              {hasStills && (
                <Focusable
                  className={source === "recent" ? "on" : undefined}
                  focusKey="wall:recent"
                  onSelect={() => onSource("recent")}
                >
                  最近观看剧照
                </Focusable>
              )}
              <Focusable
                className={source === "black" ? "on" : undefined}
                focusKey="wall:black"
                onSelect={() => onSource("black")}
              >
                纯黑
              </Focusable>
            </div>
            <p className="src-note">{noteFor(source, thumbs.length)}</p>
            <div className="thumbs">
              {source === "black" || !hasStills ? (
                <Focusable className="none" disabled focusKey="wall:none">
                  纯黑
                </Focusable>
              ) : (
                thumbs.map((url, index) => (
                  <Focusable
                    key={`${url}-${index}`}
                    className={index === current ? "thumb on" : "thumb"}
                    focusKey={`wall:${index}`}
                    ariaLabel={`壁纸 ${index + 1}`}
                    onSelect={() => onPick(index)}
                  >
                    <Image src={url} alt={`壁纸 ${index + 1}`} fit="cover" />
                  </Focusable>
                ))
              )}
            </div>
            <p className="foot">选中后立即生效 · 无操作 3 秒自动收起</p>
          </div>
        </FocusTrap>
      )}
    </div>
  );
}
