import { Focusable } from "../base/Focusable";
import { Modal } from "../base/Modal";

export interface SourceOption {
  id: string;
  label: string;
  detail?: string;
}

interface SourceMenuProps {
  open: boolean;
  options: SourceOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** 画布「播放源浮层」：320×268，选项 300×76。 */
export function SourceMenu({ open, options, selectedId, onSelect, onClose }: SourceMenuProps) {
  return (
    <Modal open={open} name="sources" onClose={onClose} className="source-menu">
      {options.length === 0 ? (
        <p className="menu-empty">当前没有可用播放源</p>
      ) : (
        <div className="menu-list">
          {options.map((option) => (
            <Focusable
              key={option.id}
              className={option.id === selectedId ? "menu-row on" : "menu-row"}
              focusKey={`src:${option.id}`}
              onSelect={() => onSelect(option.id)}
            >
              <span className="t">{option.label}</span>
              {option.detail && <span className="d">{option.detail}</span>}
            </Focusable>
          ))}
        </div>
      )}
    </Modal>
  );
}
