"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-api";
import { formatCurrency } from "@/lib/format";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  line_total: number;
}

interface OrderRow {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  address: string;
  notes?: string | null;
  total: number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

const statuses = [
  "PENDIENTE",
  "CONFIRMADO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const res = await adminFetch("/api/admin/orders");
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.error ?? "No se pudo cargar pedidos.");
        setOrders([]);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        setError("Respuesta invalida de pedidos.");
        setOrders([]);
        return;
      }
      setOrders(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar pedidos.";
      setError(message);
      setOrders([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    setError(null);
    const res = await adminFetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? "No se pudo actualizar el estado.");
      return;
    }
    await loadOrders();
  };

  return (
    <AdminShell title="Pedidos">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-100 px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {order.code}
                  </p>
                  <p className="text-xs text-slate-500">{order.customer_name}</p>
                  <p className="text-xs text-slate-400">{order.phone}</p>
                  <p className="text-xs text-slate-400">{order.address}</p>
                  {order.notes ? (
                    <p className="text-xs text-slate-400">
                      Notas: {order.notes}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-700">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-xs text-slate-400">{order.status}</p>
                </div>
              </div>
              {order.order_items?.length ? (
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.product_name}
                      </span>
                      <span>{formatCurrency(item.line_total)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600"
                  value={order.status}
                  onChange={(event) => updateStatus(order.id, event.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {order.status === "PENDIENTE" ? (
                  <button
                    onClick={() => updateStatus(order.id, "CONFIRMADO")}
                    className="rounded-full bg-brand-red px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white"
                  >
                    Confirmar
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
