"use client";
import { useEffect, useState } from "react";

const COLORS = ["#fb923c", "#facc15", "#22c55e", "#38bdf8", "#a78bfa", "#f472b6"];

export function Celebrate({ show, onDone }: { show: boolean; onDone: () => void }) {
  const [pieces, setPieces] = useState<
    { x: number; color: string; delay: number; dur: number; rot: number }[]
  >([]);

  useEffect(() => {
    if (!show) return;
    setPieces(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.3,
        dur: 1 + Math.random() * 1.2,
        rot: Math.random() * 360,
      }))
    );
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f;
        o.type = "sine";
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
        o.start(ctx.currentTime + i * 0.12);
        o.stop(ctx.currentTime + i * 0.12 + 0.35);
      });
    } catch {}
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pop text-9xl">🎉</div>
      </div>
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 w-3 h-4 rounded"
          style={{
            left: `${p.x}%`,
            background: p.color,
            animation: `confetti ${p.dur}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
