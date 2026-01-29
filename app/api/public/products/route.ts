import { NextResponse } from "next/server";
import { getSupabaseAdminConfig, supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface DbCategory {
  name: string | null;
}

interface DbProduct {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number | string;
  old_price: number | string | null;
  rating: number | string | null;
  badge: string | null;
  image_url: string | null;
  stock: number | null;
  active: boolean | null;
  category_id: string | null;
  categories?: DbCategory | DbCategory[] | null;
}

const resolveCategoryName = (product: DbProduct) => {
  const categories = product.categories;
  if (Array.isArray(categories)) {
    return categories[0]?.name ?? "Sin categoria";
  }
  return categories?.name ?? "Sin categoria";
};

const mapDbProduct = (product: DbProduct) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  category: resolveCategoryName(product),
  price: Number(product.price),
  oldPrice: product.old_price ? Number(product.old_price) : undefined,
  rating: product.rating ? Number(product.rating) : 5,
  badge: product.badge ?? undefined,
  image: product.image_url ?? "",
  shortDescription: product.short_description ?? "",
  description: product.description ?? "",
  stock: product.stock ?? 0,
  active: product.active ?? true,
  categoryId: product.category_id ?? null,
});

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
    .from("products")
    .select(
      "id, slug, name, short_description, description, price, old_price, rating, badge, image_url, stock, active, category_id, categories(name)"
    )
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(mapDbProduct));
}
