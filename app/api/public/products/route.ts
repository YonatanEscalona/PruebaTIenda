import { NextResponse } from "next/server";
import {
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
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

const account = process.env.AZURE_STORAGE_ACCOUNT ?? "";
const key = process.env.AZURE_STORAGE_KEY ?? "";
const container = process.env.AZURE_STORAGE_CONTAINER ?? "";
const hasAzure = Boolean(account && key && container);
const credential = hasAzure ? new StorageSharedKeyCredential(account, key) : null;
const baseHost = hasAzure ? `${account}.blob.core.windows.net` : "";
const basePath = hasAzure ? `/${container}/` : "";

const signImageUrl = (raw: string | null) => {
  if (!raw || !credential) return raw ?? "";
  try {
    const parsed = new URL(raw);
    if (parsed.hostname !== baseHost || !parsed.pathname.startsWith(basePath)) {
      return raw;
    }

    const blobName = parsed.pathname.slice(basePath.length);
    if (!blobName) return raw;

    const startsOn = new Date(Date.now() - 2 * 60 * 1000);
    const expiresOn = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const sas = generateBlobSASQueryParameters(
      {
        containerName: container,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        protocol: SASProtocol.Https,
        startsOn,
        expiresOn,
      },
      credential
    ).toString();

    return `${parsed.origin}${parsed.pathname}?${sas}`;
  } catch {
    return raw;
  }
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
  image: signImageUrl(product.image_url),
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
