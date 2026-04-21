import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST: create a new family with a fresh 6-digit code.
export async function POST() {
  const sb = supabaseAdmin();
  for (let i = 0; i < 10; i++) {
    const code = genCode();
    const { data, error } = await sb
      .from("families")
      .insert({ code })
      .select()
      .single();
    if (!error && data) {
      const family = data as { id: string; code: string };
      await sb.from("routines").insert({
        family_id: family.id,
        name: "朝の支度",
        schedule_type: "daily",
        sort_order: 0,
      });
      return Response.json({ id: family.id, code: family.code });
    }
    if (error && !String(error.message).includes("duplicate")) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  return Response.json({ error: "Could not allocate code" }, { status: 500 });
}

// PUT: log in with an existing family code.
export async function PUT(req: NextRequest) {
  const body = (await req.json()) as { code?: string };
  const code = (body.code || "").trim();
  if (!/^\d{6}$/.test(code)) {
    return Response.json({ error: "6-digit code required" }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("families")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
}
