/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";

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

interface ProductForm {
  name: string;
  slug: string;
  price: string;
  oldPrice: string;
  stock: string;
  badge: string;
  imageUrl: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  active: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  price: "",
  oldPrice: "",
  stock: "",
  badge: "",
  imageUrl: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const handleChange = (field: keyof ProductForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/blob", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "",
          size: file.size,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(payload?.error ?? "No se pudo generar URL de subida.");
        setUploading(false);
        return;
      }
      const payload = await res.json();
      const uploadRes = await fetch(payload.uploadUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": payload.contentType ?? "application/octet-stream",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        setError("Error subiendo imagen a Azure Blob.");
        setUploading(false);
        return;
      }

      const verifyRes = await adminFetch("/api/admin/blob/verify", {
        method: "POST",
        body: JSON.stringify({ blobName: payload.blobName }),
      });
      if (!verifyRes.ok) {
        const verifyPayload = await verifyRes.json().catch(() => null);
        setError(verifyPayload?.error ?? "No se pudo verificar la imagen.");
        setUploading(false);
        return;
      }

      handleChange("imageUrl", payload.publicUrl);
    } catch {
      setError("Error subiendo imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setError(null);

    const toNumber = (value: string) => {
      const cleaned = value.replace(/[^\d]/g, "");
      return cleaned ? Number(cleaned) : 0;
    };

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      price: toNumber(form.price),
      old_price: form.oldPrice ? toNumber(form.oldPrice) : null,
      stock: toNumber(form.stock),
      badge: form.badge.trim() || null,
      image_url: form.imageUrl.trim() || null,
      short_description: form.shortDescription.trim() || null,
      description: form.description.trim() || null,
      category_id: form.categoryId || null,
      active: form.active,
    };

    const url = editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";
    const method = editingId ? "PATCH" : "POST";

    const res = await adminFetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("No se pudo guardar el producto.");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadData();
  };

  const handleEdit = (product: ProductRow) => {
    setEditingId(product.id);
    setForm({
      name: product.name ?? "",
      slug: product.slug ?? "",
      price: String(product.price ?? ""),
      oldPrice: product.old_price ? String(product.old_price) : "",
      stock: String(product.stock ?? ""),
      badge: product.badge ?? "",
      imageUrl: product.image_url ?? "",
      shortDescription: product.short_description ?? "",
      description: product.description ?? "",
      categoryId: product.category_id ?? "",
      active: product.active ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    const res = await adminFetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("No se pudo eliminar el producto.");
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
    <AdminShell title="Productos">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? "Editar producto" : "Nuevo producto"}
        </h2>
        <div className="mt-4 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Nombre del producto
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="Ej. Zapatillas Running Pro"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Precio
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="0.00"
                value={form.price}
                onChange={(event) => handleChange("price", event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Precio anterior
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="0.00"
                value={form.oldPrice}
                onChange={(event) => handleChange("oldPrice", event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Stock
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="0"
                value={form.stock}
                onChange={(event) => handleChange("stock", event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Etiqueta
              </label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={form.badge}
                onChange={(event) => handleChange("badge", event.target.value)}
              >
                <option value="">Sin etiqueta</option>
                <option value="Oferta destacada">Oferta destacada</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Hot">Hot</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Categoria
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              value={form.categoryId}
              onChange={(event) => handleChange("categoryId", event.target.value)}
            >
              <option value="">Sin categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Descripcion corta
            </label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              rows={3}
              placeholder="Breve resumen del producto..."
              value={form.shortDescription}
              onChange={(event) => handleChange("shortDescription", event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Descripcion completa
            </label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              rows={5}
              placeholder="Escribe aqui los detalles del producto..."
              value={form.description}
              onChange={(event) => handleChange("description", event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Imagen (Azure Blob)
            </label>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
              <span className="text-brand-red">Elegir archivo</span> o arrastra aqui
              <span className="mt-1 text-xs text-slate-400">
                {form.imageUrl ? "Imagen cargada" : "No se ha seleccionado ningun archivo"}
              </span>
              <input
                type="file"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
              />
            </label>
            {uploading ? (
              <p className="mt-2 text-xs text-slate-500">Subiendo...</p>
            ) : null}
            {form.imageUrl ? (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <span className="text-xs text-slate-500">{form.imageUrl}</span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Activo</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={form.active}
                onChange={(event) => handleChange("active", event.target.checked)}
              />
              <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-brand-red" />
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSubmit}
              className="rounded-full bg-brand-red px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              {editingId ? "Actualizar producto" : "Guardar producto"}
            </button>
            {editingId ? (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
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
                    onClick={() => handleEdit(product)}
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
