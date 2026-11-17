import { Focusable } from "../base/Focusable";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ROWS = [LETTERS.slice(0, 10), LETTERS.slice(10, 20), LETTERS.slice(20)];

interface KeyPadProps {
  onKey: (char: string) => void;
  onSpace: () => void;
  onDelete: () => void;
  onClear: () => void;
  onSearch: () => void;
}

/**
 * 画布搜索键盘：键位 56×62、圆角 14、白 7% 底 + 10% 描边，
 * 三行字母错位排列，底行 空格/清空/删除/搜索。
 */
export function KeyPad({ onKey, onSpace, onDelete, onClear, onSearch }: KeyPadProps) {
  return (
    <div className="keypad">
      {ROWS.map((row, rowIndex) => (
        <div className={rowIndex ? `krow offset-${rowIndex}` : "krow"} key={rowIndex}>
          {row.map((letter) => (
            <Focusable
              key={letter}
              className="kkey"
              focusKey={`key:${letter}`}
              onSelect={() => onKey(letter)}
            >
              {letter}
            </Focusable>
          ))}
        </div>
      ))}
      <div className="krow last">
        <Focusable className="kkey wide" focusKey="key:space" onSelect={onSpace}>
          空格
        </Focusable>
        <Focusable className="kkey mid" focusKey="key:clear" onSelect={onClear}>
          清空
        </Focusable>
        <Focusable className="kkey mid" focusKey="key:delete" onSelect={onDelete}>
          删除
        </Focusable>
        <Focusable className="kkey go" focusKey="key:search" onSelect={onSearch}>
          搜索
        </Focusable>
      </div>
    </div>
  );
}
