"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/lib/products";
import { fetchProducts } from "@/lib/products-data";

export default function CatalogProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await fetchProducts();
      if (!active) return;
      setProducts(data);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-slate-600">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-slate-600">Aun no hay productos publicados.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
