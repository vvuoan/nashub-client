import { useEffect, useState } from "react";

const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export interface ClockView {
  time: string;
  date: string;
  saverTime: string;
  saverDate: string;
}

export function useClock(): ClockView {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const date = `${now.getMonth() + 1}月${now.getDate()}日 ${WEEK[now.getDay()]}`;

  return { time, date, saverTime: time, saverDate: date };
}
