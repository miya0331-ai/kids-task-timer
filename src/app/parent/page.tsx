"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFamily, clearFamily } from "@/lib/family";
import type { RoutineWithTasks } from "@/lib/types";

export default function ParentHome() {
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineWithTasks[] | null>(null);
  const [family, setFam] = useState<{ id: string; code: string } | null>(null);

  useEffect(() => {
    const f = getFamily();
    if (!f) {
      router.replace("/login");
      return;
    }
    setFam(f);
    fetch(`/api/routines?family_id=${f.id}`)
      .then((r) => r.json())
      .then(setRoutines);
  }, [router]);

  async function addRoutine() {
    if (!family) return;
    const res = await fetch("/api/routines", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        family_id: family.id,
        name: "新しいルーチン",
        sort_order: routines?.length ?? 0,
      }),
    });
    const j = await res.json();
    router.push(`/parent/routines/${j.id}`);
  }

  return (
    <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-700">
          おうちのひと（設定）
        </h1>
        <Link
          href="/kids"
          className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold"
        >
          こどもがつかう →
        </Link>
      </div>

      {family && (
        <div className="mb-6 p-4 bg-white rounded-2xl shadow">
          <div className="text-xs text-gray-500">家族コード</div>
          <div className="text-3xl font-mono tracking-[0.3em] text-orange-600">
            {family.code}
          </div>
          <button
            onClick={() => {
              clearFamily();
              router.replace("/login");
            }}
            className="mt-2 text-xs text-gray-400 underline"
          >
            ログアウト
          </button>
        </div>
      )}

      <div className="space-y-3">
        {routines?.map((r) => (
          <Link
            key={r.id}
            href={`/parent/routines/${r.id}`}
            className="block p-4 bg-white rounded-2xl shadow hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">{r.name}</div>
                <div className="text-sm text-gray-500">
                  {r.tasks.length}個のやること・
                  {r.schedule_type === "daily" && "まいにち"}
                  {r.schedule_type === "weekday" && "曜日ごと"}
                  {r.schedule_type === "date" && "指定した日"}
                </div>
              </div>
              <div className="text-2xl">›</div>
            </div>
          </Link>
        ))}
        {routines && (
          <button
            onClick={addRoutine}
            className="w-full p-4 border-2 border-dashed border-orange-300 text-orange-600 rounded-2xl font-bold"
          >
            ＋ ルーチンを追加
          </button>
        )}
      </div>
    </main>
  );
}
