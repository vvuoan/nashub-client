import { Focusable } from "./Focusable";

interface StepperProps {
  value: string;
  label: string;
  focusKey?: string;
  min?: number;
  max?: number;
  step?: number;
  current?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/** 画布「步进器」：减号 + 数值 + 加号，44 高胶囊。 */
export function Stepper({
  value,
  label,
  focusKey,
  min = 0,
  max = 100,
  step = 1,
  current = 0,
  disabled,
  onChange,
}: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <Focusable
        className="step"
        focusKey={focusKey ? `${focusKey}:minus` : undefined}
        disabled={disabled || current <= min}
        ariaLabel={`${label} 减少`}
        onSelect={() => onChange(Math.max(min, current - step))}
      >
        −
      </Focusable>
      <span className="step-val">{value}</span>
      <Focusable
        className="step"
        focusKey={focusKey ? `${focusKey}:plus` : undefined}
        disabled={disabled || current >= max}
        ariaLabel={`${label} 增加`}
        onSelect={() => onChange(Math.min(max, current + step))}
      >
        +
      </Focusable>
    </div>
  );
}
