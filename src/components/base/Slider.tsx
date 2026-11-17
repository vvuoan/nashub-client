import { Focusable } from "./Focusable";

interface SliderProps {
  value: number;
  label: string;
  focusKey?: string;
  step?: number;
  onChange: (value: number) => void;
}

/** 0–100 滑杆：左右方向键调整，不移动焦点。 */
export function Slider({ value, label, focusKey, step = 5, onChange }: SliderProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <Focusable
      className="slider"
      focusKey={focusKey}
      ariaLabel={`${label} ${Math.round(clamped)}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.stopPropagation();
          onChange(Math.max(0, clamped - step));
        } else if (event.key === "ArrowRight") {
          event.stopPropagation();
          onChange(Math.min(100, clamped + step));
        }
      }}
    >
      <span className="rail">
        <i style={{ width: `${clamped}%` }} />
      </span>
      <span className="val">{Math.round(clamped)}</span>
    </Focusable>
  );
}
