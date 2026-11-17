import { Focusable } from "./Focusable";

export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedProps {
  value: string;
  options: SegmentedOption[];
  label: string;
  focusKey?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

/** 画布「分段选择」：44 高胶囊，选中项白底深字。 */
export function Segmented({ value, options, label, focusKey, disabled, onChange }: SegmentedProps) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((option) => (
        <Focusable
          key={option.value}
          className={option.value === value ? "segopt on" : "segopt"}
          focusKey={focusKey ? `${focusKey}:${option.value}` : undefined}
          disabled={disabled}
          ariaLabel={`${label}：${option.label}`}
          onSelect={() => onChange(option.value)}
        >
          {option.label}
        </Focusable>
      ))}
    </div>
  );
}
