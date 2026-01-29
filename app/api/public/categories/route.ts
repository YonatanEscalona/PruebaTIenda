import { NextResponse } from "next/server";
import { getSupabaseAdminConfig, supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  if (!supabaseAdmin) {
    const { missing } = getSupabaseAdminConfig();
    const detail = missing.length ? `Missing: ${missing.join(", ")}` : "";
    return NextResponse.json(
      {
        error: ["Supabase not configured", detail].filter(Boolean).join(". "),
      },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
