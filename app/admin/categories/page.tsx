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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      const res = await adminFetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data ?? []);
    } catch {
      setError("No se pudo cargar categorias.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setError(null);
    const payload = { name: name.trim(), slug: slugify(name) };
    const res = await adminFetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("No se pudo crear la categoria.");
      return;
    }
    setName("");
    await loadCategories();
  };

  const handleDelete = async (id: string) => {
    const res = await adminFetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("No se pudo eliminar la categoria.");
      return;
    }
    await loadCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const payload = {
      name: editingName.trim(),
      slug: slugify(editingName),
    };
    const res = await adminFetch(`/api/admin/categories/${editingId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("No se pudo actualizar la categoria.");
      return;
    }
    setEditingId(null);
    setEditingName("");
    await loadCategories();
  };

  return (
    <AdminShell title="Categorias">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold text-slate-900">Nueva categoria</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej: Audio"
          />
          <button
            onClick={handleCreate}
            className="rounded-full bg-brand-red px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
          >
            Crear
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
            >
              {editingId === category.id ? (
                <input
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                />
              ) : (
                <div>
                  <p className="font-semibold text-slate-900">{category.name}</p>
                  <p className="text-xs text-slate-400">{category.slug}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                {editingId === category.id ? (
                  <button
                    onClick={handleUpdate}
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-red"
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
