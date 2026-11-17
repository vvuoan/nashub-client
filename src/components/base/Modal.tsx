import { useEffect, type ReactNode } from "react";
import { FocusTrap } from "./FocusTrap";

interface ModalProps {
  open: boolean;
  title?: string;
  name: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** 关闭后把焦点还给指定元素；缺省回到打开弹层前的元素 */
  returnFocusKey?: string;
}

/** 通用弹层：遮罩 + 焦点陷阱 + Esc 关闭。 */
export function Modal({ open, title, name, onClose, children, className, returnFocusKey }: ModalProps) {
  if (!open) return null;

  return (
    <ModalBody
      title={title}
      name={name}
      onClose={onClose}
      className={className}
      returnFocusKey={returnFocusKey}
    >
      {children}
    </ModalBody>
  );
}

function ModalBody({
  title,
  name,
  onClose,
  children,
  className,
  returnFocusKey,
}: Omit<ModalProps, "open">) {
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      const target = returnFocusKey
        ? document.querySelector<HTMLElement>(
            `[data-focus-key="${CSS.escape(returnFocusKey)}"]`,
          )
        : opener;
      window.requestAnimationFrame(() => target?.focus());
    };
  }, [returnFocusKey]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-mask" onClick={onClose} />
      <FocusTrap name={name} className={["modal-body", className].filter(Boolean).join(" ")} onClose={onClose}>
        {title && <h2 className="modal-title">{title}</h2>}
        {children}
      </FocusTrap>
    </div>
  );
}
