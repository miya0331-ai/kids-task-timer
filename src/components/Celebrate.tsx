"use client";
import { useEffect, useRef, useState } from "react";

const COLORS = ["#fb923c", "#facc15", "#22c55e", "#38bdf8", "#a78bfa", "#f472b6"];
const DURATION_MS = 3000;

function playFirework() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const t0 = ctx.currentTime;

    // 1) launch whistle: sweep 200 → 2000 Hz
    const whistle = ctx.createOscillator();
    whistle.type = "sawtooth";
    whistle.frequency.setValueAtTime(220, t0);
    whistle.frequency.exponentialRampToValueAtTime(2200, t0 + 0.35);
    const wg = ctx.createGain();
    wg.gain.setValueAtTime(0.0001, t0);
    wg.gain.exponentialRampToValueAtTime(0.08, t0 + 0.1);
    wg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.36);
    whistle.connect(wg).connect(ctx.destination);
    whistle.start(t0);
    whistle.stop(t0 + 0.4);

    // 2) boom: filtered white-noise burst
    const boomAt = t0 + 0.38;
    const bufSize = Math.floor(ctx.sampleRate * 0.7);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = Math.pow(1 - i / bufSize, 2.5);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1600, boomAt);
    filter.frequency.exponentialRampToValueAtTime(400, boomAt + 0.6);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.55, boomAt);
    ng.gain.exponentialRampToValueAtTime(0.001, boomAt + 0.7);
    noise.connect(filter).connect(ng).connect(ctx.destination);
    noise.start(boomAt);
    noise.stop(boomAt + 0.75);

    // 3) crackles: short highpass-filtered noise bursts
    for (let k = 0; k < 10; k++) {
      const ct = boomAt + 0.15 + k * 0.06 + Math.random() * 0.04;
      const cSize = Math.floor(ctx.sampleRate * 0.06);
      const cBuf = ctx.createBuffer(1, cSize, ctx.sampleRate);
      const cData = cBuf.getChannelData(0);
      for (let i = 0; i < cSize; i++) {
        cData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / cSize, 3);
      }
      const cn = ctx.createBufferSource();
      cn.buffer = cBuf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 2500;
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(0.12, ct);
      cg.gain.exponentialRampToValueAtTime(0.001, ct + 0.05);
      cn.connect(hp).connect(cg).connect(ctx.destination);
      cn.start(ct);
      cn.stop(ct + 0.06);
    }
  } catch {}
}

export function Celebrate({
  show,
  onDone,
}: {
  show: boolean;
  onDone: () => void;
}) {
  const [pieces, setPieces] = useState<
    { x: number; color: string; delay: number; dur: number; rot: number }[]
  >([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!show) return;
    setPieces(
      Array.from({ length: 60 }, () => ({
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        dur: 1.5 + Math.random() * 1.5,
        rot: Math.random() * 360,
      }))
    );
    playFirework();
    const t = window.setTimeout(() => onDoneRef.current(), DURATION_MS);
    return () => window.clearTimeout(t);
  }, [show]);

  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pop text-9xl">🎆</div>
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
