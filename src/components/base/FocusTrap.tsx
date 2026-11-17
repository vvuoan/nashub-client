import type { ReactNode } from "react";
import { FocusScope } from "./FocusScope";

interface FocusTrapProps {
  name: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

/** 弹层焦点陷阱：方向键锁在容器内，Esc 关闭。 */
export function FocusTrap({ name, children, className, onClose }: FocusTrapProps) {
  return (
    <FocusScope name={name} className={className} autoFocus>
      <div
        onKeyDown={(event) => {
          if (!onClose) return;
          if (event.key === "Escape" || event.key === "Backspace") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }}
      >
        {children}
      </div>
    </FocusScope>
  );
}
