"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { addToCart } from "@/lib/cart";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({
  product,
  className = "",
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      onClick={handleAdd}
      className={`rounded-full bg-brand-red px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition ${className}`}
      type="button"
    >
      {added ? "Agregado" : "Agregar"}
    </button>
  );
}
