import { Focusable } from "./Focusable";

interface SwitchProps {
  checked: boolean;
  label: string;
  focusKey?: string;
  onChange: (checked: boolean) => void;
}

/** 开关：遥控器 OK 切换。 */
export function Switch({ checked, label, focusKey, onChange }: SwitchProps) {
  return (
    <Focusable
      className={checked ? "switch on" : "switch"}
      focusKey={focusKey}
      ariaLabel={`${label}：${checked ? "开" : "关"}`}
      onSelect={() => onChange(!checked)}
    >
      <span className="knob" />
    </Focusable>
  );
}
