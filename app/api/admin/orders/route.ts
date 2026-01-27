import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, code, customer_name, phone, address, notes, total, status, created_at, order_items(id, product_name, quantity, line_total)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mapped = (data ?? []).map((order) => ({
    ...order,
    total: Number(order.total),
    order_items: order.order_items?.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      line_total: Number(item.line_total),
    })),
  }));

  return NextResponse.json(mapped);
}
