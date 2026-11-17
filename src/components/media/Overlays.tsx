export function Cue({ visible, count }: { visible: boolean; count: number }) {
  return (
    <div className="cue" hidden={!visible}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 14.6 12 8.6l6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>继续观看</span>
      {count > 0 && <span className="n">{count}</span>}
    </div>
  );
}

export function Hint({ text, show }: { text: string; show: boolean }) {
  return (
    <div className={show ? "hint show" : "hint"} role="status">
      {text}
    </div>
  );
}
