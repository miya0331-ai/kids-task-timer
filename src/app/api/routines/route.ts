import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const familyId = req.nextUrl.searchParams.get("family_id");
  if (!familyId) return Response.json({ error: "family_id required" }, { status: 400 });
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("routines")
    .select("*, tasks(*)")
    .eq("family_id", familyId)
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "tasks", ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("routines")
    .insert({
      family_id: body.family_id,
      name: body.name || "新しいルーチン",
      schedule_type: body.schedule_type || "daily",
      schedule_config: body.schedule_config || {},
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
