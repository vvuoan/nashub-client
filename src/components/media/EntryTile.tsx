import type { CSSProperties } from "react";
import { TileIcon } from "../../lib/icons";
import type { NavTile } from "../../types";
import { Focusable } from "../base/Focusable";

interface EntryTileProps {
  tile: NavTile;
  onSelect: (id: string) => void;
}

/** 画布「入口磁贴」：268×150，聚焦放大 1.06，圆角 22。 */
export function EntryTile({ tile, onSelect }: EntryTileProps) {
  return (
    <Focusable
      className="tile"
      focusKey={`tile:${tile.id}`}
      ariaLabel={tile.name}
      style={{ "--tone": tile.tone } as CSSProperties}
      onSelect={() => onSelect(tile.id)}
    >
      <span className="art" />
      <span className="face">
        <TileIcon name={tile.icon} className="ico" />
        <span className="nm">{tile.name}</span>
      </span>
    </Focusable>
  );
}
