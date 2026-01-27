"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StoreShell from "@/components/store/StoreShell";
import { cartTotals, clearCart, readCart } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";
import { formatCurrency } from "@/lib/format";

interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

const ORDER_KEY = "se_last_order";

export default function CheckoutPage() {
  const router = useRouter();
  const [items] = useState<CartItem[]>(() =>
    typeof window === "undefined" ? [] : readCart()
  );
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totals = cartTotals(items);

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.name || !form.phone || !form.address) {
      setError("Completa nombre, telefono y direccion.");
      return;
    }

    if (items.length === 0) {
      setError("Tu carrito esta vacio.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          phone: form.phone,
          address: form.address,
          notes: form.notes,
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "No pudimos crear el pedido.");
        setSubmitting(false);
        return;
      }

      const payload = (await response.json()) as { order_code: string };
      const orderPayload = {
        code: payload.order_code,
        name: form.name,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
        items,
        total: totals.subtotal,
        createdAt: new Date().toISOString(),
        status: "PENDIENTE",
      };

      window.localStorage.setItem(ORDER_KEY, JSON.stringify(orderPayload));
      clearCart();
      router.push(`/gracias?code=${payload.order_code}`);
    } catch {
      setError("Ocurrio un error al crear el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StoreShell>
      <section className="mx-auto w-full max-w-5xl px-6 pt-6">
        <h1 className="text-3xl font-bold uppercase italic text-black">
          Checkout invitado
        </h1>
        {items.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-slate-600">No hay productos en tu carrito.</p>
            <Link
              href="/catalogo"
              className="mt-4 inline-flex rounded-full bg-brand-red px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Volver al catalogo
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
            >
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Nombre y apellido
                </label>
                <input
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  placeholder="Ej: Sebastian Escalona"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Telefono
                </label>
                <input
                  value={form.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  placeholder="Ej: +56 9 1234 5678"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Direccion
                </label>
                <input
                  value={form.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  placeholder="Ej: Av. Principal 123"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Notas
                </label>
                <textarea
                  value={form.notes}
                  onChange={(event) => handleChange("notes", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  rows={3}
                  placeholder="Indicaciones de entrega, color, compatibilidad..."
                />
              </div>
              {error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-full bg-brand-red px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Confirmar pedido"}
              </button>
              <p className="text-xs text-slate-500">
                Pagos solo por transferencia o efectivo. Tu pedido quedara en
                estado PENDIENTE.
              </p>
            </form>
            <div className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {items.map((item) => (
                  <div key={item.slug} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </StoreShell>
  );
}
