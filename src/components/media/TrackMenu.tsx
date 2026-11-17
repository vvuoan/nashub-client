import { Focusable } from "../base/Focusable";
import { Modal } from "../base/Modal";

export interface TrackOption {
  id: string;
  label: string;
  detail?: string;
}

interface TrackMenuProps {
  open: boolean;
  title: string;
  name: string;
  options: TrackOption[];
  selectedId?: string;
  emptyLabel?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** 音轨/字幕轨通用选择弹层。 */
export function TrackMenu({
  open,
  title,
  name,
  options,
  selectedId,
  emptyLabel = "没有可选轨道",
  onSelect,
  onClose,
}: TrackMenuProps) {
  return (
    <Modal open={open} title={title} name={name} onClose={onClose} className="track-menu">
      {options.length === 0 ? (
        <p className="menu-empty">{emptyLabel}</p>
      ) : (
        <div className="menu-list">
          {options.map((option) => (
            <Focusable
              key={option.id}
              className={option.id === selectedId ? "menu-row on" : "menu-row"}
              focusKey={`${name}:${option.id}`}
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
