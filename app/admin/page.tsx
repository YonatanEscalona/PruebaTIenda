"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-api";
import { formatCurrency } from "@/lib/format";
import {
  Package,
  FolderOpen,
  ShoppingCart,
  Clock,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: number;
  customer_name: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface Summary {
  products: number;
  categories: number;
  orders: number;
  pending: number;
  revenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
  CONFIRMADO: { label: "Confirmado", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  ENVIADO: { label: "Enviado", color: "bg-purple-100 text-purple-700", icon: TrendingUp },
  ENTREGADO: { label: "Entregado", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function AdminPage() {
  const [summary, setSummary] = useState<Summary>({
    products: 0,
    categories: 0,
    orders: 0,
    pending: 0,
    revenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
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
        (order: Order) => order.status === "PENDIENTE"
      ).length;

      const totalRevenue = (orders ?? [])
        .filter((order: Order) => order.status !== "CANCELADO")
        .reduce((acc: number, order: Order) => acc + (order.total || 0), 0);

      const recentOrders = (orders ?? [])
        .sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      const lowStockProducts = (products ?? [])
        .filter((p: Product) => p.stock !== undefined && p.stock <= 5)
        .slice(0, 5);

      setSummary({
        products: products?.length ?? 0,
        categories: categories?.length ?? 0,
        orders: orders?.length ?? 0,
        pending: pendingCount,
        revenue: totalRevenue,
        recentOrders,
        lowStockProducts,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el resumen.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cards = [
    {
      label: "Productos",
      value: summary.products,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/25",
      href: "/admin/products",
    },
    {
      label: "Categorías",
      value: summary.categories,
      icon: FolderOpen,
      color: "from-emerald-500 to-emerald-600",
      shadowColor: "shadow-emerald-500/25",
      href: "/admin/categories",
    },
    {
      label: "Pedidos",
      value: summary.orders,
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/25",
      href: "/admin/orders",
    },
    {
      label: "Pendientes",
      value: summary.pending,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      shadowColor: "shadow-amber-500/25",
      href: "/admin/orders",
      highlight: summary.pending > 0,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminShell title="Dashboard">
      {/* Header con acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-slate-500">
            Bienvenido al panel de administración
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Cards de resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-lg hover:-translate-y-1 ${
                card.highlight ? "ring-2 ring-amber-400" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {loading ? "—" : card.value}
                  </p>
                </div>
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg ${card.shadowColor}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-brand-red transition-colors">
                Ver detalles
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
              {card.highlight && (
                <div className="absolute top-3 right-3">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Revenue Card */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-red to-red-600 p-6 text-white shadow-xl shadow-red-500/25">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Ingresos Totales
            </p>
            <p className="mt-2 text-4xl font-bold">
              {loading ? "—" : formatCurrency(summary.revenue)}
            </p>
            <p className="mt-1 text-sm text-white/70">
              De {summary.orders - (summary.orders - summary.pending)} pedidos completados
            </p>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Grid de tablas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pedidos recientes */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Pedidos Recientes</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-brand-red hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-2 w-16 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : summary.recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {summary.recentOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.PENDIENTE;
                const StatusIcon = status.icon;
                return (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className={`grid h-10 w-10 place-items-center rounded-full ${status.color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {order.customer_name || "Cliente"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(order.total)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Productos con bajo stock */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Bajo Stock</h2>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-brand-red hover:underline"
            >
              Ver productos
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="h-12 w-12 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-slate-200 rounded" />
                    <div className="h-2 w-20 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : summary.lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-300 mb-3" />
              <p className="text-sm text-slate-500">Todo el inventario está bien</p>
            </div>
          ) : (
            <div className="space-y-2">
              {summary.lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href="/admin/products"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <AlertCircle className="h-3 w-3" />
                      {product.stock} uds
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-2xl bg-slate-50 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Acciones Rápidas</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-red hover:shadow-md transition-all group"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Nuevo Producto</p>
              <p className="text-xs text-slate-500">Agregar al catálogo</p>
            </div>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-red hover:shadow-md transition-all group"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Nueva Categoría</p>
              <p className="text-xs text-slate-500">Organizar productos</p>
            </div>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-red hover:shadow-md transition-all group"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Ver Pedidos</p>
              <p className="text-xs text-slate-500">Gestionar órdenes</p>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-red hover:shadow-md transition-all group"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-brand-red group-hover:text-white transition-colors">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Ver Tienda</p>
              <p className="text-xs text-slate-500">Abrir frontend</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
