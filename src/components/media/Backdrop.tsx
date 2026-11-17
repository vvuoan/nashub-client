interface BackdropProps {
  url: string | null;
  black: boolean;
}

export function Backdrop({ url, black }: BackdropProps) {
  return (
    <>
      <div
        className={black ? "wall black" : "wall"}
        style={url ? { backgroundImage: `url("${url}")` } : undefined}
      />
      <div className="wall-dim" />
      <div className="scrim" />
    </>
  );
}
