import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Params {
  params: Promise<{ id: string }>;
}

const allowedStatuses = new Set([
  "PENDIENTE",
  "CONFIRMADO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
]);

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await req.json();
  const status = String(body.status ?? "").toUpperCase();

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Estado invalido" }, { status: 400 });
  }

  if (status === "CONFIRMADO") {
    const { error } = await supabaseAdmin.rpc("confirm_order", {
      p_order_id: id,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
