interface ProgressBarProps {
  /** 0–100 */
  value: number;
  className?: string;
  /** 无障碍标签，如「播放进度」 */
  label?: string;
}

export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={["progress", className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <i style={{ width: `${clamped}%` }} />
    </div>
  );
}
