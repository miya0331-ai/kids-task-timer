import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const familyId = form.get("family_id");
  if (!(file instanceof File)) {
    return Response.json({ error: "file required" }, { status: 400 });
  }
  if (typeof familyId !== "string") {
    return Response.json({ error: "family_id required" }, { status: 400 });
  }
  const ext = file.name.split(".").pop() || "png";
  const path = `${familyId}/${crypto.randomUUID()}.${ext}`;
  const sb = supabaseAdmin();
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage
    .from("task-images")
    .upload(path, buf, { contentType: file.type, upsert: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const { data } = sb.storage.from("task-images").getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
