import type { ReactNode } from "react";
import { Focusable } from "./Focusable";

interface IconButtonProps {
  label: string;
  children: ReactNode;
  focusKey?: string;
  className?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

/** 纯图标按钮，尺寸/定位由 className 决定。 */
export function IconButton({ label, children, focusKey, className, disabled, onSelect }: IconButtonProps) {
  return (
    <Focusable
      className={["iconbtn", className].filter(Boolean).join(" ")}
      focusKey={focusKey}
      ariaLabel={label}
      disabled={disabled}
      onSelect={onSelect}
    >
      {children}
    </Focusable>
  );
}
