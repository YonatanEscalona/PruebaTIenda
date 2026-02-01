"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import type { Product } from "@/lib/products";
import { addToCart } from "@/lib/cart";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  variant?: "default" | "icon" | "full";
}

export default function AddToCartButton({
  product,
  className = "",
  variant = "default",
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    
    // Disparar evento custom para actualizar contadores del carrito
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    
    window.setTimeout(() => setAdded(false), 1500);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdd}
        className={`grid h-10 w-10 place-items-center rounded-xl bg-brand-red text-white shadow-lg shadow-red-500/25 transition-all hover:scale-110 active:scale-95 ${
          added ? "bg-emerald-500 shadow-emerald-500/25" : ""
        } ${className}`}
        type="button"
        aria-label="Agregar al carrito"
      >
        {added ? (
          <Check className="h-5 w-5 animate-bounce" />
        ) : (
          <ShoppingCart className="h-5 w-5" />
        )}
      </button>
    );
  }

  if (variant === "full") {
    return (
      <button
        onClick={handleAdd}
        className={`flex items-center justify-center gap-2 w-full rounded-xl bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 active:scale-[0.98] ${
          added ? "bg-emerald-500 shadow-emerald-500/25" : ""
        } ${className}`}
        type="button"
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            <span>¡Agregado!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            <span>Agregar al carrito</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex items-center gap-2 rounded-full bg-brand-red px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all hover:bg-red-600 active:scale-95 ${
        added ? "bg-emerald-500" : ""
      } ${className}`}
      type="button"
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          <span>Agregado</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          <span>Agregar</span>
        </>
      )}
    </button>
  );
}
