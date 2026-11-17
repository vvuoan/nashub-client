import { Focusable } from "./Focusable";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  label: string;
  focusKey?: string;
  onChange: (value: string) => void;
}

/** 左右切换的选项控件（设置页用）。 */
export function Select({ value, options, label, focusKey, onChange }: SelectProps) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const current = options[index];

  const step = (delta: number) => {
    if (!options.length) return;
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
  };

  return (
    <Focusable
      className="select"
      focusKey={focusKey}
      ariaLabel={`${label}：${current?.label ?? "未设置"}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.stopPropagation();
          step(-1);
        } else if (event.key === "ArrowRight") {
          event.stopPropagation();
          step(1);
        }
      }}
    >
      <span className="label">{label}</span>
      <span className="value">{current?.label ?? "—"}</span>
    </Focusable>
  );
}
