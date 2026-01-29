import { NextResponse } from "next/server";
import { getSupabaseAdminConfig, supabaseAdmin } from "@/lib/supabase/admin";
import { generateOrderCode } from "@/lib/orders";

interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export async function POST(req: Request) {
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

  const body = await req.json();
  const customerName = String(body.customer_name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const items = (body.items ?? []) as OrderItemInput[];

  if (!customerName || !phone || !address) {
    return NextResponse.json(
      { error: "Nombre, telefono y direccion son requeridos" },
      { status: 400 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Items requeridos" },
      { status: 400 }
    );
  }

  const productIds = items.map((item) => item.product_id);

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, name, price, active")
    .in("id", productIds)
    .eq("active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!products || products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Algunos productos no estan disponibles" },
      { status: 400 }
    );
  }

  let total = 0;
  let orderItems: {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

  try {
    orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      const qty = Number(item.quantity ?? 0);
      if (!product || qty <= 0) {
        throw new Error("Item invalido");
      }
      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * qty;
      total += lineTotal;

      return {
        product_id: product.id,
        product_name: product.name,
        unit_price: unitPrice,
        quantity: qty,
        line_total: lineTotal,
      };
    });
  } catch {
    return NextResponse.json({ error: "Items invalidos" }, { status: 400 });
  }

  const orderCode = generateOrderCode();

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      code: orderCode,
      customer_name: customerName,
      phone,
      address,
      notes: notes || null,
      total,
      status: "PENDIENTE",
    })
    .select("id, code")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "" }, { status: 500 });
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(
      orderItems.map((item) => ({
        ...item,
        order_id: order.id,
      }))
    );

  if (itemsError) {
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ order_code: order.code });
}
