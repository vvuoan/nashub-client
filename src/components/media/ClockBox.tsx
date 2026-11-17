interface ClockBoxProps {
  date: string;
  time: string;
  lunar?: string | null;
  weather?: string | null;
}

export function ClockBox({ date, time, lunar, weather }: ClockBoxProps) {
  return (
    <header className="clockbox">
      <p className="date">
        {date}
        {lunar ? ` · ${lunar}` : ""}
      </p>
      <h1 className="clock">{time}</h1>
      {weather && (
        <p className="wx">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7.2 18.2h9.3a3.6 3.6 0 0 0 .4-7.18 5.2 5.2 0 0 0-9.98 1.06 3.1 3.1 0 0 0 .28 6.12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span>{weather}</span>
        </p>
      )}
    </header>
  );
}
