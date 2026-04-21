"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFamily } from "@/lib/family";
import type { RoutineWithTasks, Task } from "@/lib/types";
import { VisualTimer } from "@/components/VisualTimer";
import { Celebrate } from "@/components/Celebrate";

function todayJST() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600 * 1000);
  return jst.toISOString().slice(0, 10);
}

function pickActiveRoutine(routines: RoutineWithTasks[]): RoutineWithTasks | null {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600 * 1000);
  const dow = jst.getUTCDay();
  const date = jst.toISOString().slice(0, 10);

  for (const r of routines) {
    if (r.schedule_type === "date" && r.schedule_config.date === date) return r;
  }
  for (const r of routines) {
    if (
      r.schedule_type === "weekday" &&
      r.schedule_config.weekdays?.includes(dow)
    )
      return r;
  }
  for (const r of routines) {
    if (r.schedule_type === "daily") return r;
  }
  return routines[0] ?? null;
}

export default function KidsPage() {
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineWithTasks[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    const f = getFamily();
    if (!f) return router.replace("/login");
    fetch(`/api/routines?family_id=${f.id}`)
      .then((r) => r.json())
      .then((rs: RoutineWithTasks[]) => {
        setRoutines(rs);
        const active = pickActiveRoutine(rs);
        if (active) {
          setSelectedId(active.id);
          fetch(`/api/completions?routine_id=${active.id}&date=${todayJST()}`)
            .then((r) => r.json())
            .then(
              (cs: { task_id: string }[]) =>
                setCompleted(new Set(cs.map((c) => c.task_id)))
            );
        }
      });
  }, [router]);

  useEffect(() => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => setNow(Date.now()), 500);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const routine = useMemo(
    () => routines?.find((r) => r.id === selectedId) ?? null,
    [routines, selectedId]
  );

  const tasks = routine?.tasks ?? [];
  const remaining = tasks.filter((t) => !completed.has(t.id));
  const done = tasks.filter((t) => completed.has(t.id));
  const current = remaining[0] ?? null;

  useEffect(() => {
    if (current) setStartedAt((prev) => prev ?? Date.now());
    else setStartedAt(null);
    // reset startedAt when current changes
  }, [current?.id]); // eslint-disable-line

  useEffect(() => {
    setStartedAt(Date.now());
  }, [current?.id]);

  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const remainingSec = current ? Math.max(0, current.duration_sec - elapsed) : 0;

  async function complete(task: Task) {
    setCompleted((s) => new Set(s).add(task.id));
    setCelebrate(true);
    await fetch("/api/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task_id: task.id }),
    });
  }

  async function undo(task: Task) {
    const next = new Set(completed);
    next.delete(task.id);
    setCompleted(next);
    await fetch(`/api/completions?task_id=${task.id}`, { method: "DELETE" });
  }

  if (!routines) {
    return (
      <div className="flex-1 flex items-center justify-center text-orange-400">
        よみこみ中…
      </div>
    );
  }

  if (!routine || tasks.length === 0) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="text-6xl">🙂</div>
        <div className="text-lg text-gray-500">やることが まだ ないよ</div>
        <Link
          href="/parent"
          className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold"
        >
          おうちのひとに設定してもらう
        </Link>
      </main>
    );
  }

  const allDone = remaining.length === 0;

  return (
    <main className="flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-orange-700">{routine.name}</h1>
        <div className="flex items-center gap-3">
          {routines.length > 1 && (
            <select
              value={routine.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-sm"
            >
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
          <Link href="/parent" className="text-sm text-gray-400 underline">
            設定
          </Link>
        </div>
      </div>

      {allDone && (
        <div className="mb-4 p-6 bg-white rounded-3xl shadow flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="text-6xl">🌟</div>
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">
              ぜんぶ できた！
            </div>
            <div className="text-gray-500 text-sm">すごいね！</div>
          </div>
        </div>
      )}
      {(
        <div className="flex-1 grid md:grid-cols-[1fr_auto_1fr] gap-4">
          <section className="bg-white rounded-3xl p-4 shadow flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-gray-600 mb-2 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-orange-400" />
              やること（{remaining.length}）
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {remaining.map((t, i) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-2xl flex items-center gap-3 ${
                    i === 0 ? "bg-orange-50 ring-2 ring-orange-300" : "bg-gray-50"
                  }`}
                >
                  <TaskIcon task={t} />
                  <div className="flex-1">
                    <div className="font-bold text-lg">{t.title || "やること"}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(t.duration_sec / 60)}分
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow flex flex-col items-center justify-center gap-4 min-w-[280px]">
            {!current && (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-2">🎉</div>
                <div className="text-sm">ぜんぶ おわったよ</div>
                <div className="text-xs mt-2">右の「戻す」で やりなおせるよ</div>
              </div>
            )}
            {current && (
              <>
                <TaskIcon task={current} big />
                <div className="text-2xl font-bold text-center">
                  {current.title || "やること"}
                </div>
                <VisualTimer
                  totalSec={current.duration_sec}
                  remainingSec={remainingSec}
                />
                <button
                  onClick={() => complete(current)}
                  className="w-full py-6 text-2xl font-bold bg-green-500 text-white rounded-3xl active:scale-95 shadow-lg"
                >
                  ✓ できた！
                </button>
              </>
            )}
          </section>

          <section className="bg-white rounded-3xl p-4 shadow flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-gray-600 mb-2 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-400" />
              やった（{done.length}）
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {done.map((t) => (
                <div
                  key={t.id}
                  className="w-full p-3 rounded-2xl flex items-center gap-3 bg-green-50"
                >
                  <TaskIcon task={t} />
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg line-through text-gray-500">
                      {t.title || "やること"}
                    </div>
                  </div>
                  <button
                    onClick={() => undo(t)}
                    aria-label="やることに戻す"
                    className="shrink-0 px-3 py-2 bg-white border-2 border-orange-300 text-orange-600 rounded-xl font-bold text-sm active:scale-95 flex items-center gap-1"
                  >
                    <span className="text-lg leading-none">↶</span>
                    <span>戻す</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <Celebrate show={celebrate} onDone={() => setCelebrate(false)} />
    </main>
  );
}

function TaskIcon({ task, big }: { task: Task; big?: boolean }) {
  const size = big ? "w-32 h-32 text-7xl" : "w-14 h-14 text-3xl";
  if (task.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={task.image_url}
        alt=""
        className={`${size} object-cover rounded-2xl`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-2xl bg-orange-100 flex items-center justify-center`}
    >
      {task.emoji || "🙂"}
    </div>
  );
}
