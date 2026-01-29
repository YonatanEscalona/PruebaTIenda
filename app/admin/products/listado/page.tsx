"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-api";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  stock: number;
  active: boolean;
  badge: string | null;
  image_url: string | null;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  categories?: { name: string | null } | null;
}

export default function AdminProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        adminFetch("/api/admin/products"),
        adminFetch("/api/admin/categories"),
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
      const [productsData, categoriesData] = await Promise.all([
        parseList(productsRes, "productos"),
        parseList(categoriesRes, "categorias"),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar productos.";
      setError(message);
      setProducts([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await adminFetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(
        typeof payload?.error === "string"
          ? payload.error
          : "No se pudo eliminar el producto."
      );
      return;
    }
    await loadData();
  };

  const categoryTabs = [
    { id: "all", label: "Todos" },
    { id: "none", label: "Sin categoria" },
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
    })),
  ];

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "none") return !product.category_id;
    return product.category_id === selectedCategory;
  });

  return (
    <AdminShell title="Listado de productos">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
          <button
            onClick={() => router.push("/admin/products")}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600"
          >
            Nuevo producto
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
                  isActive
                    ? "bg-black text-white"
                    : "border border-slate-200 bg-white text-slate-500"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 px-4 py-6 text-center text-xs text-slate-500">
              No hay productos en esta categoria.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-400">
                    {product.categories?.name ?? "Sin categoria"} - Stock {product.stock} - {product.active ? "Activo" : "Inactivo"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(`/admin/products?edit=${product.id}`)
                    }
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AdminShell>
  );
}
