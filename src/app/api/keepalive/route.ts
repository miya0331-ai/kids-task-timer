import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Vercel Cron pings this endpoint so Supabase Free doesn't auto-pause
// after a week of inactivity. Authenticated via the CRON_SECRET header
// that Vercel injects automatically.
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const sb = supabaseAdmin();
    const { count, error } = await sb
      .from("families")
      .select("*", { count: "exact", head: true });
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true, count, pingedAt: new Date().toISOString() });
  } catch (e: unknown) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
