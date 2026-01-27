"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2, Home, ShoppingCart, User } from "lucide-react";

const items = [
  { label: "Inicio", icon: Home, href: "/" },
  { label: "Catalogo", icon: Grid2x2, href: "/catalogo" },
  { label: "Carrito", icon: ShoppingCart, href: "/carrito" },
  { label: "Admin", icon: User, href: "/admin/login" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="mx-auto flex w-full max-w-md items-center justify-between border-t border-slate-200 bg-white px-6 py-3 shadow-[0_-12px_30px_-20px_rgba(15,23,42,0.35)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 text-xs text-slate-400"
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-brand-red" : "text-slate-400"}`}
              />
              <span className={isActive ? "text-brand-red" : "text-slate-400"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
