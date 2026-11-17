import { IconButton } from "../base/IconButton";

interface CornerButtonProps {
  onClick: () => void;
}

/** 首页右上角壁纸入口（48×48）。 */
export function CornerButton({ onClick }: CornerButtonProps) {
  return (
    <IconButton label="壁纸" className="corner" focusKey="wall:open" onSelect={onClick}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m5.5 17 4.6-4.2 3 2.7 2.4-2.1 3 3.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </IconButton>
  );
}
