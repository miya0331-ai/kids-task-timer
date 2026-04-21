import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tasks")
    .insert({
      routine_id: body.routine_id,
      title: body.title || "やること",
      emoji: body.emoji ?? null,
      image_url: body.image_url ?? null,
      duration_sec: body.duration_sec ?? 300,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
