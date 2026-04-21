import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("routines")
    .select("*, tasks(*)")
    .eq("id", id)
    .order("sort_order", { referencedTable: "tasks", ascending: true })
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const sb = supabaseAdmin();
  const patch: Record<string, unknown> = {};
  for (const k of ["name", "schedule_type", "schedule_config", "sort_order"]) {
    if (k in body) patch[k] = body[k];
  }
  const { data, error } = await sb
    .from("routines")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = supabaseAdmin();
  const { error } = await sb.from("routines").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
