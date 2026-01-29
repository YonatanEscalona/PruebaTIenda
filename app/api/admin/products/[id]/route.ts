import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? "").trim() || slugify(name);

  if (!name || !slug) {
    return NextResponse.json({ error: "Nombre y slug requeridos" }, { status: 400 });
  }

  const payload = {
    name,
    slug,
    price: Number(body.price ?? 0),
    old_price: body.old_price ? Number(body.old_price) : null,
    stock: Number(body.stock ?? 0),
    badge: body.badge ?? null,
    image_url: body.image_url ?? null,
    short_description: body.short_description ?? null,
    description: body.description ?? null,
    category_id: body.category_id ?? null,
    active: body.active ?? true,
  };

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(payload)
    .eq("id", id)
    .select(
      "id, name, slug, price, old_price, stock, active, badge, image_url, short_description, description, category_id, categories(name)"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "id, name, slug, price, old_price, stock, active, badge, image_url, short_description, description, category_id, categories(name)"
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
