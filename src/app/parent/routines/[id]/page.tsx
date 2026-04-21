"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFamily } from "@/lib/family";
import type { RoutineWithTasks, Task, ScheduleType } from "@/lib/types";
import { EmojiPicker } from "@/components/EmojiPicker";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function RoutineEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [routine, setRoutine] = useState<RoutineWithTasks | null>(null);
  const [family, setFamily] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const f = getFamily();
    if (!f) return router.replace("/login");
    setFamily(f);
    refresh();
  }, [router, id]); // eslint-disable-line

  async function refresh() {
    const r = await fetch(`/api/routines/${id}`).then((x) => x.json());
    setRoutine(r);
  }

  async function patchRoutine(patch: Partial<RoutineWithTasks>) {
    await fetch(`/api/routines/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    refresh();
  }

  async function addTask() {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        routine_id: id,
        title: "",
        emoji: "🙂",
        duration_sec: 300,
        sort_order: routine?.tasks.length ?? 0,
      }),
    });
    refresh();
  }

  async function deleteRoutine() {
    if (!confirm("このルーチンを削除しますか？")) return;
    await fetch(`/api/routines/${id}`, { method: "DELETE" });
    router.replace("/parent");
  }

  if (!routine) return <div className="p-8 text-gray-400">よみこみ中…</div>;

  return (
    <main className="flex-1 p-4 max-w-3xl mx-auto w-full pb-24">
      <Link href="/parent" className="text-orange-600 text-sm">
        ← もどる
      </Link>

      <div className="mt-3 p-4 bg-white rounded-2xl shadow space-y-4">
        <input
          value={routine.name}
          onChange={(e) => setRoutine({ ...routine, name: e.target.value })}
          onBlur={() => patchRoutine({ name: routine.name })}
          className="w-full text-2xl font-bold border-b-2 border-orange-200 focus:border-orange-500 focus:outline-none py-2"
        />

        <div>
          <div className="text-sm text-gray-500 mb-2">いつ？</div>
          <div className="flex gap-2 flex-wrap">
            {(["daily", "weekday", "date"] as ScheduleType[]).map((t) => (
              <button
                key={t}
                onClick={() => patchRoutine({ schedule_type: t })}
                className={`px-4 py-2 rounded-full font-bold text-sm ${
                  routine.schedule_type === t
                    ? "bg-orange-500 text-white"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                {t === "daily" && "まいにち"}
                {t === "weekday" && "曜日ごと"}
                {t === "date" && "日付を指定"}
              </button>
            ))}
          </div>

          {routine.schedule_type === "weekday" && (
            <div className="mt-3 flex gap-2">
              {WEEKDAYS.map((w, i) => {
                const active =
                  routine.schedule_config.weekdays?.includes(i) ?? false;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const cur = routine.schedule_config.weekdays ?? [];
                      const next = active
                        ? cur.filter((x) => x !== i)
                        : [...cur, i];
                      patchRoutine({
                        schedule_config: {
                          ...routine.schedule_config,
                          weekdays: next,
                        },
                      });
                    }}
                    className={`w-10 h-10 rounded-full font-bold ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          )}

          {routine.schedule_type === "date" && (
            <input
              type="date"
              value={routine.schedule_config.date || ""}
              onChange={(e) =>
                patchRoutine({
                  schedule_config: {
                    ...routine.schedule_config,
                    date: e.target.value,
                  },
                })
              }
              className="mt-3 px-4 py-2 border-2 border-orange-200 rounded-xl"
            />
          )}
        </div>
      </div>

      <h2 className="mt-6 mb-3 font-bold text-orange-700">やること</h2>
      <div className="space-y-2">
        {routine.tasks.map((t) => (
          <TaskRow key={t.id} task={t} familyId={family?.id || ""} onChange={refresh} />
        ))}
        <button
          onClick={addTask}
          className="w-full p-4 border-2 border-dashed border-orange-300 text-orange-600 rounded-2xl font-bold"
        >
          ＋ やることを追加
        </button>
      </div>

      <button
        onClick={deleteRoutine}
        className="mt-8 text-sm text-red-400 underline"
      >
        このルーチンを削除
      </button>
    </main>
  );
}

function TaskRow({
  task,
  familyId,
  onChange,
}: {
  task: Task;
  familyId: string;
  onChange: () => void;
}) {
  const [local, setLocal] = useState(task);
  const [uploading, setUploading] = useState(false);

  async function patch(p: Partial<Task>) {
    const next = { ...local, ...p };
    setLocal(next);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    });
    onChange();
  }

  async function del() {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onChange();
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("family_id", familyId);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json();
    setUploading(false);
    if (j.url) patch({ image_url: j.url });
  }

  return (
    <div className="p-3 bg-white rounded-2xl shadow flex gap-3 items-start">
      <div className="flex flex-col items-center gap-1">
        {local.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={local.image_url}
            alt=""
            className="w-24 h-24 object-cover rounded-2xl"
          />
        ) : (
          <EmojiPicker
            value={local.emoji}
            onChange={(v) => patch({ emoji: v, image_url: null })}
          />
        )}
        <label className="text-[10px] text-orange-500 underline cursor-pointer">
          {uploading ? "..." : local.image_url ? "絵文字に戻す" : "写真を使う"}
          {local.image_url ? null : (
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f);
              }}
            />
          )}
          {local.image_url && (
            <button
              type="button"
              className="hidden"
              onClick={() => patch({ image_url: null })}
            />
          )}
        </label>
        {local.image_url && (
          <button
            type="button"
            onClick={() => patch({ image_url: null })}
            className="text-[10px] text-gray-400 underline"
          >
            絵文字に戻す
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <input
          value={local.title}
          onChange={(e) => setLocal({ ...local, title: e.target.value })}
          onBlur={() => patch({ title: local.title })}
          placeholder="やることの名前"
          className="w-full text-lg font-bold border-b-2 border-orange-100 focus:border-orange-400 focus:outline-none py-1"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">時間</label>
          <input
            type="number"
            min={1}
            max={60}
            value={Math.round(local.duration_sec / 60)}
            onChange={(e) =>
              setLocal({
                ...local,
                duration_sec: Math.max(1, Number(e.target.value)) * 60,
              })
            }
            onBlur={() => patch({ duration_sec: local.duration_sec })}
            className="w-16 px-2 py-1 border-2 border-orange-200 rounded-lg text-center"
          />
          <span className="text-sm text-gray-500">分</span>
          <button onClick={del} className="ml-auto text-red-400 text-sm">
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
