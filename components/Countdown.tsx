"use client";

import { useEffect, useState } from "react";

function getRemaining() {
  const end = new Date("2026-06-30T23:59:59+01:00").getTime();
  const distance = Math.max(0, end - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export function Countdown({ compact = false }: { compact?: boolean }) {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setTime(getRemaining());
    const timer = window.setInterval(() => setTime(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const values = [
    ["Days", time.days],
    ["Hours", time.hours],
    ["Mins", time.minutes],
    ["Secs", time.seconds],
  ];

  return (
    <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2 md:gap-3"}`}>
      {values.map(([label, value]) => (
        <div key={label} className="flex items-center gap-1.5 md:gap-3">
          <div
            className={`rounded-xl border border-white/10 bg-white/[0.045] text-center ${
              compact ? "min-w-12 px-2 py-1.5" : "min-w-[62px] px-3 py-3 md:min-w-[76px]"
            }`}
          >
            <p
              className={`font-display font-bold tabular-nums ${
                compact ? "text-sm" : "text-xl md:text-2xl"
              }`}
            >
              {String(value).padStart(2, "0")}
            </p>
            <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-widest text-white/40">
              {label}
            </p>
          </div>
          {label !== "Secs" && (
            <span className="font-display text-xs font-bold text-white/25">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
