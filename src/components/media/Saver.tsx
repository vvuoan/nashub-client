interface SaverProps {
  on: boolean;
  time: string;
  date: string;
}

export function Saver({ on, time, date }: SaverProps) {
  return (
    <div className={on ? "saver-ui on" : "saver-ui"} aria-hidden={!on}>
      <p className="saver-clock">{time}</p>
      <p className="saver-date">{date}</p>
    </div>
  );
}
