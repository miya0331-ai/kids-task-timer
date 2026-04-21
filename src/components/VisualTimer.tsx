"use client";

export function VisualTimer({
  totalSec,
  remainingSec,
}: {
  totalSec: number;
  remainingSec: number;
}) {
  const pct = Math.max(0, Math.min(1, remainingSec / totalSec));
  const r = 90;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const mins = Math.floor(remainingSec / 60);
  const secs = Math.floor(remainingSec % 60);
  const over = remainingSec <= 0;

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#fed7aa" strokeWidth="16" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={over ? "#f87171" : pct < 0.25 ? "#fb923c" : "#22c55e"}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-5xl sm:text-6xl font-bold tabular-nums ${over ? "text-red-500" : "text-gray-800"}`}>
          {mins}:{String(secs).padStart(2, "0")}
        </div>
        <div className="text-sm text-gray-500 mt-1">{over ? "じかん！" : "のこり"}</div>
      </div>
    </div>
  );
}
