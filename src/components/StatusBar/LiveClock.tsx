import { useEffect, useState } from "react";

export interface LiveClockProps {
  timeZone?: string;
}

function formatTime(date: Date, timeZone?: string): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  });
}

export function LiveClock({ timeZone }: LiveClockProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <span aria-hidden="true">{formatTime(now, timeZone)}</span>;
}
