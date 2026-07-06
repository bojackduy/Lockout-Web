import { useEffect, useState } from 'react';

function formatSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

type Props = {
  startTime: number;
  durationMinutes: number;
};

export function Timer({ startTime, durationMinutes }: Props) {
  const [, setTick] = useState(0);
  const endTime = startTime + durationMinutes * 60;
  const now = Date.now() / 1000;
  const remaining = endTime - now;

  useEffect(() => {
    const timer = window.setInterval(() => setTick((tick) => tick + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={remaining <= 0 ? 'timer ended' : 'timer'}>
      <span>{remaining <= 0 ? 'Match ended' : 'Time left'}</span>
      <strong>{formatSeconds(remaining)}</strong>
    </div>
  );
}
