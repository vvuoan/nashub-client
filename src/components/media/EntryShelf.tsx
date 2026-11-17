import type { NavTile } from "../../types";
import { EntryTile } from "./EntryTile";

interface EntryShelfProps {
  tiles: NavTile[];
  onSelect: (id: string) => void;
}

/** 首页底板：1792×214，圆角 52。 */
export function EntryShelf({ tiles, onSelect }: EntryShelfProps) {
  return (
    <section className="shelf" aria-label="入口">
      <div className="tiles">
        {tiles.map((tile) => (
          <EntryTile key={tile.id} tile={tile} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
