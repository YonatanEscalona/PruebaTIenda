export const dynamic = "force-dynamic";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import StoreShell from "@/components/store/StoreShell";
import AddToCartButton from "@/components/store/AddToCartButton";
import { formatCurrency } from "@/lib/format";
import { fetchProductBySlug } from "@/lib/products-data";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <StoreShell>
      <section className="mx-auto w-full max-w-6xl px-6 pt-6">
        <Link
          href="/catalogo"
          className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-red"
        >
          Volver al catalogo
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-8">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-72 w-72 object-contain"
                />
              ) : (
                <div className="h-72 w-72 rounded-3xl bg-slate-200" />
              )}
            </div>
          </div>
          <div className="space-y-4">
            {product.badge ? (
              <span className="inline-flex rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white">
                {product.badge}
              </span>
            ) : null}
            <h1 className="text-3xl font-bold text-black">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-yellow-400">?</span>
              <span>{product.rating}</span>
              <span>•</span>
              <span>{product.category}</span>
            </div>
            <div>
              {product.oldPrice ? (
                <p className="text-sm text-slate-400 line-through">
                  {formatCurrency(product.oldPrice)}
                </p>
              ) : null}
              <p className="text-3xl font-semibold text-brand-red">
                {formatCurrency(product.price)}
              </p>
            </div>
            <p className="text-sm text-slate-600">{product.shortDescription}</p>
            <p className="text-sm text-slate-600">{product.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <AddToCartButton product={product} className="px-6 py-3" />
              <Link
                href="/carrito"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700"
              >
                Ir al carrito
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-500">
              Stock disponible: {product.stock}
            </div>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}

