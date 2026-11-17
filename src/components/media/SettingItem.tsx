import type { ReactNode } from "react";

interface SettingItemProps {
  label: string;
  description?: string;
  /** 控件由基础组件提供（Switch / Select / Slider），本组件不感知具体实现 */
  control: ReactNode;
  /** 仅说明用途，不参与数据 */
  disabledHint?: string;
}

/** 设置行：左侧标题与说明，右侧控件。 */
export function SettingItem({ label, description, control, disabledHint }: SettingItemProps) {
  return (
    <div className="setting-item">
      <div className="texts">
        <p className="label">{label}</p>
        {(description || disabledHint) && <p className="desc">{description ?? disabledHint}</p>}
      </div>
      <div className="control">{control}</div>
    </div>
  );
}
