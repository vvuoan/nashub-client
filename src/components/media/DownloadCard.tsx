import { Focusable } from "../base/Focusable";

export interface DownloadTask {
  id: string;
  /** 0–100，仅用于视觉演示 */
  pct: number;
}

interface DownloadCardProps {
  tasks: DownloadTask[];
  expanded: boolean;
  onToggle: () => void;
}

/** 画布「下载进度卡」：收起 340×168 / 展开 420×304。 */
export function DownloadCard({ tasks, expanded, onToggle }: DownloadCardProps) {
  return (
    <Focusable
      className={expanded ? "dlcard open" : "dlcard"}
      focusKey="dl:card"
      ariaLabel={expanded ? "收起下载任务" : "展开下载任务"}
      onSelect={onToggle}
    >
      <span className="dl-head">
        <span className="dl-title">下载中</span>
        <span className="dl-count">{tasks.length} 个任务</span>
        <span className="dl-more">{expanded ? "收起" : "全部"}</span>
      </span>
      <span className="dl-list">
        {tasks.map((task) => (
          <span className="dl-task" key={task.id}>
            <span className="dl-task-bar" aria-hidden="true" />
            <span className="dl-task-track" aria-hidden="true">
              <i style={{ width: `${task.pct}%` }} />
            </span>
            <span className="dl-task-pct">{task.pct}%</span>
          </span>
        ))}
      </span>
      <span className="dl-foot">
        <span className="dl-speed down">下载 —</span>
        <span className="dl-speed">上传 —</span>
      </span>
    </Focusable>
  );
}
