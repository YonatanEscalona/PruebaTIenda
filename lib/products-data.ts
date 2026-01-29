import "server-only";
import type { Product } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabasePublic } from "@/lib/supabase/public";

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

const mapDbProduct = (product: DbProduct): Product => {
  return {
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
  };
};

const fetchProductsWithClient = async () => {
  const { data, error } = await supabasePublic
    .from("products")
    .select(
      "id, slug, name, short_description, description, price, old_price, rating, badge, image_url, stock, active, category_id, categories(name)"
    )
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error || !data) return null;
  return data;
};

const fetchProductsWithAdmin = async () => {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "id, slug, name, short_description, description, price, old_price, rating, badge, image_url, stock, active, category_id, categories(name)"
    )
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error || !data) return null;
  return data;
};

export const fetchProducts = async (): Promise<Product[]> => {
  if (supabasePublic) {
    const data = await fetchProductsWithClient();
    if (data) {
      return data.map(mapDbProduct);
    }
  }

  const adminData = await fetchProductsWithAdmin();
  if (!adminData) return [];
  return adminData.map(mapDbProduct);
};

const fetchProductBySlugWithClient = async (slug: string) => {
  const { data, error } = await supabasePublic
    .from("products")
    .select(
      "id, slug, name, short_description, description, price, old_price, rating, badge, image_url, stock, active, category_id, categories(name)"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as DbProduct;
};

const fetchProductBySlugWithAdmin = async (slug: string) => {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "id, slug, name, short_description, description, price, old_price, rating, badge, image_url, stock, active, category_id, categories(name)"
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as DbProduct;
};

export const fetchProductBySlug = async (
  slug: string
): Promise<Product | null> => {
  if (supabasePublic) {
    const data = await fetchProductBySlugWithClient(slug);
    if (data) {
      return mapDbProduct(data);
    }
  }

  const adminData = await fetchProductBySlugWithAdmin(slug);
  if (!adminData) return null;
  return mapDbProduct(adminData);
};
