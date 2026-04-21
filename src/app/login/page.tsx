"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setFamily } from "@/lib/family";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function login() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/family", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "ログインできませんでした");
      setFamily({ id: j.id, code: j.code });
      router.replace("/kids");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function createNew() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/family", { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "作成できませんでした");
      setFamily({ id: j.id, code: j.code });
      alert(`家族コード: ${j.code}\nメモしてください（他のデバイスで使えます）`);
      router.replace("/parent");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-orange-600">
          やることタイマー
        </h1>
        <p className="text-center text-sm text-gray-500">
          家族コード（6桁）を入力
        </p>
        <input
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full text-center text-4xl tracking-[0.5em] py-4 border-2 border-orange-300 rounded-2xl focus:outline-none focus:border-orange-500"
          placeholder="------"
        />
        {err && <div className="text-red-500 text-sm text-center">{err}</div>}
        <button
          onClick={login}
          disabled={busy || code.length !== 6}
          className="w-full py-4 bg-orange-500 text-white text-xl font-bold rounded-2xl disabled:opacity-40 active:scale-95 transition"
        >
          はじめる
        </button>
        <div className="text-center text-sm text-gray-400">または</div>
        <button
          onClick={createNew}
          disabled={busy}
          className="w-full py-3 border-2 border-orange-400 text-orange-600 font-bold rounded-2xl active:scale-95 transition"
        >
          新しい家族コードを作る
        </button>
      </div>
    </main>
  );
}
