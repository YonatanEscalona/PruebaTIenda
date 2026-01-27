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
        const products = await productsRes.json();
        const categories = await categoriesRes.json();
        const orders = await ordersRes.json();

        const pendingCount = (orders ?? []).filter(
          (order: { status: string }) => order.status === "PENDIENTE"
        ).length;

        setSummary({
          products: products?.length ?? 0,
          categories: categories?.length ?? 0,
          orders: orders?.length ?? 0,
          pending: pendingCount,
        });
      } catch {
        setError("No se pudo cargar el resumen.");
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
