/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState } from "react";
import StoreShell from "@/components/store/StoreShell";
import { cartTotals, readCart, removeFromCart, updateQuantity } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";
import { formatCurrency } from "@/lib/format";

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>(() =>
    typeof window === "undefined" ? [] : readCart()
  );

  const handleQtyChange = (slug: string, quantity: number) => {
    const next = updateQuantity(slug, quantity);
    setItems(next);
  };

  const handleRemove = (slug: string) => {
    const next = removeFromCart(slug);
    setItems(next);
  };

  const totals = cartTotals(items);

  return (
    <StoreShell>
      <section className="mx-auto w-full max-w-5xl px-6 pt-6">
        <h1 className="text-3xl font-bold uppercase italic text-black">
          Carrito
        </h1>
        {items.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-slate-600">Tu carrito esta vacio.</p>
            <Link
              href="/catalogo"
              className="mt-4 inline-flex rounded-full bg-brand-red px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Ir al catalogo
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 object-contain"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-slate-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-sm"
                        onClick={() =>
                          handleQtyChange(item.slug, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="min-w-[24px] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-sm"
                        onClick={() =>
                          handleQtyChange(item.slug, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-red"
                      onClick={() => handleRemove(item.slug)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Items</span>
                <span>{totals.itemsCount}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 inline-flex w-full justify-center rounded-full bg-brand-red px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
              >
                Ir a pagar
              </Link>
            </div>
          </div>
        )}
      </section>
    </StoreShell>
  );
}

