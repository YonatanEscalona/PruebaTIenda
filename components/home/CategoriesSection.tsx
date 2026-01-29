"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface Category {
  label: string;
  icon: LucideIcon;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({
  categories,
}: CategoriesSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-black">
          Categorias
        </h2>
        <Link
          href="/catalogo"
          className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-red"
        >
          Ver todo
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-4 sm:grid-cols-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.label} className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Icon className="h-6 w-6 text-slate-700" />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-600">
                {category.label}
              </p>
            </div>
          );
        })}
      </div>
      <Link
        href="/catalogo"
        className="mt-6 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-700"
      >
        Ver todas las categorias
      </Link>
    </section>
  );
}
