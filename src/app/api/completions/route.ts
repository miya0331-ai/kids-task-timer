import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function todayJST() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600 * 1000);
  return jst.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const routineId = req.nextUrl.searchParams.get("routine_id");
  const date = req.nextUrl.searchParams.get("date") || todayJST();
  if (!routineId) return Response.json({ error: "routine_id required" }, { status: 400 });
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("completions")
    .select("task_id, completed_at, tasks!inner(routine_id)")
    .eq("date", date)
    .eq("tasks.routine_id", routineId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { task_id: string; date?: string };
  const date = body.date || todayJST();
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("completions")
    .upsert({ task_id: body.task_id, date }, { onConflict: "task_id,date" })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("task_id");
  const date = req.nextUrl.searchParams.get("date") || todayJST();
  if (!taskId) return Response.json({ error: "task_id required" }, { status: 400 });
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("completions")
    .delete()
    .eq("task_id", taskId)
    .eq("date", date);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
