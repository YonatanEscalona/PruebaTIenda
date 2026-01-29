import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .delete()
    .eq("product_id", id);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const { error: movementsError } = await supabaseAdmin
    .from("stock_movements")
    .delete()
    .eq("product_id", id);

  if (movementsError) {
    return NextResponse.json({ error: movementsError.message }, { status: 500 });
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
