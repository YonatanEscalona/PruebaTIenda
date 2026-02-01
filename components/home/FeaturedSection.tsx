"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import type { ReactNode } from "react";

interface Product {
  slug: string;
  name: string;
  price: string;
  oldPrice?: string;
  rating: number;
  image: string;
  badge?: string;
}

interface FeaturedSectionProps {
  products: Product[];
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  emptyMessage?: string;
}

export default function FeaturedSection({
  products,
  eyebrow = "Lo más vendido",
  title = (
    <>
      Productos
      <br />
      destacados
    </>
  ),
  description,
  ctaHref = "/catalogo",
  ctaLabel = "Ver catálogo completo",
  emptyMessage = "Aún no hay productos destacados.",
}: FeaturedSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red flex items-center gap-2">
            <span className="inline-block w-8 h-0.5 bg-brand-red"></span>
            {eyebrow}
          </p>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-black leading-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-md text-sm text-slate-600 leading-relaxed">{description}</p>
          ) : null}
        </div>
        <Link
          href={ctaHref}
          aria-label={ctaLabel}
          className="group flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition-all hover:border-brand-red hover:bg-brand-red hover:shadow-lg"
        >
          <SlidersHorizontal className="h-4 w-4 text-slate-600 transition-colors group-hover:text-white" />
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-600 shadow-sm ring-1 ring-black/5">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      )}
    </section>
  );
}
