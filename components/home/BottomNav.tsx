"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Grid2x2, Home, ShoppingCart, User } from "lucide-react";
import { readCart, cartTotals } from "@/lib/cart";

const items = [
  { label: "Inicio", icon: Home, href: "/" },
  { label: "Catálogo", icon: Grid2x2, href: "/catalogo" },
  { label: "Carrito", icon: ShoppingCart, href: "/carrito", showBadge: true },
  { label: "Admin", icon: User, href: "/admin/login" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const items = readCart();
      const { itemsCount } = cartTotals(items);
      setCartCount(itemsCount);
    };

    updateCartCount();

    // Escuchar cambios en localStorage
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "se_cart") {
        updateCartCount();
      }
    };

    // Custom event para actualizaciones dentro de la misma pestaña
    const handleCartUpdate = () => updateCartCount();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="mx-auto flex w-full max-w-md items-center justify-between border-t border-slate-200 bg-white/95 backdrop-blur-md px-6 py-3 shadow-[0_-12px_30px_-20px_rgba(15,23,42,0.35)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center gap-1 text-xs group"
            >
              <div
                className={`relative grid h-10 w-10 place-items-center rounded-xl transition-all ${
                  isActive
                    ? "bg-brand-red text-white shadow-lg shadow-red-500/25"
                    : "text-slate-400 group-hover:bg-slate-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.showBadge && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand-red text-[10px] font-bold text-white shadow-sm">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`font-medium transition-colors ${
                  isActive ? "text-brand-red" : "text-slate-500 group-hover:text-slate-700"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
