"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import StoreShell from "@/components/store/StoreShell";
import type { CartItem } from "@/lib/cart";
import { formatCurrency } from "@/lib/format";
import { SITE } from "@/lib/site";
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/whatsapp";

interface StoredOrder {
  code: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
  total: number;
}

const ORDER_KEY = "se_last_order";

export default function GraciasPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [order] = useState<StoredOrder | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(ORDER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const orderCode = order?.code ?? code ?? "";

  const message = order
    ? buildWhatsAppMessage({
        code: order.code,
        name: order.name,
        phone: order.phone,
        address: order.address,
        notes: order.notes,
        items: order.items,
        total: order.total,
      })
    : `Pedido ${orderCode}`;

  const whatsappLink = buildWhatsAppLink(SITE.adminWhatsApp, message);

  return (
    <StoreShell>
      <section className="mx-auto w-full max-w-4xl px-6 pt-6 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
            Gracias por tu compra
          </p>
          <h1 className="mt-2 text-3xl font-bold text-black">Pedido recibido</h1>
          <p className="mt-2 text-sm text-slate-600">
            Tu pedido quedo en estado PENDIENTE. Un administrador lo confirmara
            manualmente.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm">
            Codigo de pedido: <span className="font-semibold">{orderCode}</span>
          </div>
          {order ? (
            <div className="mt-6 text-left">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Resumen
              </h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {order.items.map((item) => (
                  <div key={item.slug} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          ) : null}
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href={whatsappLink}
              className="inline-flex w-full justify-center rounded-full bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
              target="_blank"
              rel="noreferrer"
            >
              Enviar por WhatsApp
            </a>
            <Link
              href="/catalogo"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-red"
            >
              Volver al catalogo
            </Link>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
