import { Focusable } from "../base/Focusable";

export interface EpisodeEntry {
  id: string;
  index: number;
  title: string;
  /** 如「已看完」「未播出」；没有就不显示 */
  status?: string;
}

interface EpisodeListProps {
  episodes: EpisodeEntry[];
  activeId?: string;
  emptyLabel?: string;
  onSelect: (id: string) => void;
}

/** 分集列表：只渲染后端返回的分集，没有数据时给可见空态。 */
export function EpisodeList({
  episodes,
  activeId,
  emptyLabel = "分集信息当前不可用",
  onSelect,
}: EpisodeListProps) {
  if (!episodes.length) {
    return <p className="episodes-empty">{emptyLabel}</p>;
  }

  return (
    <div className="episodes" role="list">
      {episodes.map((episode) => (
        <Focusable
          key={episode.id}
          className={episode.id === activeId ? "episode on" : "episode"}
          focusKey={`ep:${episode.id}`}
          ariaLabel={`第 ${episode.index} 集 ${episode.title}`}
          onSelect={() => onSelect(episode.id)}
        >
          <span className="idx">{episode.index}</span>
          <span className="t">{episode.title}</span>
          {episode.status && <span className="st">{episode.status}</span>}
        </Focusable>
      ))}
    </div>
  );
}
