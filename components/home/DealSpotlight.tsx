/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/format";

interface DealSpotlightProps {
  product?: Product | null;
}

export default function DealSpotlight({ product }: DealSpotlightProps) {
  if (!product) {
    return null;
  }

  const oldPriceValue =
    typeof product.oldPrice === "number" ? product.oldPrice : null;
  const hasDiscount =
    typeof oldPriceValue === "number" &&
    oldPriceValue > 0 &&
    oldPriceValue > product.price;
  const discount =
    hasDiscount && oldPriceValue
      ? Math.round(((oldPriceValue - product.price) / oldPriceValue) * 100)
      : null;

  return (
    <section
      id="ofertas"
      className="mx-auto w-full max-w-6xl px-6 animate-[rise_0.8s_ease-out]"
      style={{ animationDelay: "120ms" }}
    >
      <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white p-6 shadow-[0_30px_55px_-35px_rgba(15,23,42,0.45)] md:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-red/10 blur-[90px]" />
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
              Oferta destacada
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">
              {product.name}
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              {product.shortDescription || "Lleva hoy lo mas buscado con envio rapido."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-semibold text-brand-red">
                {formatCurrency(product.price)}
              </p>
              {hasDiscount && oldPriceValue ? (
                <p className="text-sm text-slate-400 line-through">
                  {formatCurrency(oldPriceValue)}
                </p>
              ) : null}
              {discount ? (
                <span className="rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
                  -{discount}%
                </span>
              ) : null}
            </div>
            <Link
              href={`/producto/${product.slug}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Ver detalle
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center justify-center rounded-[28px] bg-slate-50 p-6">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-48 w-48 object-contain"
              />
            ) : (
              <div className="h-48 w-48 rounded-3xl bg-slate-200" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
