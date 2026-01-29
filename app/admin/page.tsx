"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-api";

interface Summary {
  products: number;
  categories: number;
  orders: number;
  pending: number;
}

export default function AdminPage() {
  const [summary, setSummary] = useState<Summary>({
    products: 0,
    categories: 0,
    orders: 0,
    pending: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          adminFetch("/api/admin/products"),
          adminFetch("/api/admin/categories"),
          adminFetch("/api/admin/orders"),
        ]);
        const parseList = async (res: Response, label: string) => {
          if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            const message =
              typeof payload?.error === "string"
                ? payload.error
                : `No se pudo cargar ${label}.`;
            throw new Error(message);
          }
          const data = await res.json();
          if (!Array.isArray(data)) {
            throw new Error(`Respuesta invalida para ${label}.`);
          }
          return data;
        };

        const [products, categories, orders] = await Promise.all([
          parseList(productsRes, "productos"),
          parseList(categoriesRes, "categorias"),
          parseList(ordersRes, "pedidos"),
        ]);

        const pendingCount = (orders ?? []).filter(
          (order: { status: string }) => order.status === "PENDIENTE"
        ).length;

        setSummary({
          products: products?.length ?? 0,
          categories: categories?.length ?? 0,
          orders: orders?.length ?? 0,
          pending: pendingCount,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo cargar el resumen.";
        setError(message);
      }
    };

    load();
  }, []);

  return (
    <AdminShell title="Dashboard">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Productos", value: summary.products },
          { label: "Categorias", value: summary.categories },
          { label: "Pedidos", value: summary.orders },
          { label: "Pendientes", value: summary.pending },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-bold text-black">{card.value}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
