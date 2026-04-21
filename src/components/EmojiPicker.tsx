"use client";
import { useState } from "react";

const PRESETS = [
  "🦷", "🪥", "🧼", "🚿", "🛁", "🧴",
  "👕", "👚", "👖", "🧦", "👟", "🎒",
  "🍚", "🥛", "🍞", "🍎", "🥦", "🍳",
  "📚", "📖", "✏️", "🎨", "🧩", "🎒",
  "🧸", "🚽", "🚿", "🛏️", "☀️", "🌙",
  "🏃", "🚶", "🧘", "💤", "🎮", "📺",
];

export function EmojiPicker({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-24 h-24 text-6xl bg-orange-50 border-2 border-orange-200 rounded-2xl flex items-center justify-center active:scale-95"
      >
        {value || "🙂"}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 p-3 bg-white border-2 border-orange-200 rounded-2xl shadow-xl grid grid-cols-6 gap-1 w-80">
          {PRESETS.map((e, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                onChange(e);
                setOpen(false);
              }}
              className="text-3xl w-12 h-12 rounded-lg hover:bg-orange-100 active:scale-90"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
