import { TrackMenu, type TrackOption } from "./TrackMenu";

interface SubtitleMenuProps {
  open: boolean;
  options: TrackOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** 字幕菜单：在 TrackMenu 上补一个「关闭字幕」。 */
export function SubtitleMenu({ open, options, selectedId, onSelect, onClose }: SubtitleMenuProps) {
  const withOff: TrackOption[] = [{ id: "no", label: "关闭字幕" }, ...options];

  return (
    <TrackMenu
      open={open}
      title="字幕"
      name="subs"
      options={withOff}
      selectedId={selectedId ?? "no"}
      emptyLabel="当前没有字幕轨"
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
