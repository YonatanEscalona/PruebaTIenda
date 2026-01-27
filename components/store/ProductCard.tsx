"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      {product.badge ? (
        <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white">
          {product.badge}
        </span>
      ) : null}
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="mt-6 flex items-center justify-center rounded-2xl bg-slate-50 p-4">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-40 w-40 object-contain"
            />
          ) : (
            <div className="h-40 w-40 rounded-2xl bg-slate-200" />
          )}
        </div>
      </Link>
      <div className="mt-4 space-y-2">
        <Link href={`/producto/${product.slug}`}>
          <p className="text-sm font-semibold text-slate-900">{product.name}</p>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-yellow-400">?</span>
          <span>{product.rating}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            {product.oldPrice ? (
              <p className="text-xs text-slate-400 line-through">
                {formatCurrency(product.oldPrice)}
              </p>
            ) : null}
            <p className="text-base font-semibold text-brand-red">
              {formatCurrency(product.price)}
            </p>
          </div>
          <AddToCartButton product={product} className="px-4" />
        </div>
      </div>
    </div>
  );
}

