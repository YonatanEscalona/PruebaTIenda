"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingBag,
  X,
  Home,
  Grid2x2,
  User,
  ChevronRight,
  Package,
  Phone,
} from "lucide-react";
import { readCart, cartTotals } from "@/lib/cart";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Header() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cargar cantidad del carrito
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

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/public/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch {
        // Silent fail
      }
    };
    loadCategories();
  }, []);

  // Focus en el input de búsqueda cuando se abre
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Cerrar menú con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const menuLinks = [
    { label: "Inicio", href: "/", icon: Home },
    { label: "Catálogo", href: "/catalogo", icon: Grid2x2 },
    { label: "Mi Carrito", href: "/carrito", icon: ShoppingBag },
    { label: "Admin", href: "/admin/login", icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          {/* Botón de menú */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-xl bg-slate-50 transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-3 group">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-red to-red-600 text-white shadow-lg shadow-red-500/25 transition-transform group-hover:scale-105">
              <span className="text-lg font-bold">S</span>
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="truncate text-sm font-bold text-slate-900 tracking-tight">
                Sebastian Escalona
              </p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                Tienda Online
              </p>
            </div>
          </Link>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Botón de búsqueda */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-xl bg-slate-50 transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5 text-slate-700" />
            </button>

            {/* Carrito */}
            <Link
              href="/carrito"
              className="relative grid h-11 w-11 place-items-center rounded-xl bg-slate-50 transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="h-5 w-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand-red text-[10px] font-bold text-white shadow-lg shadow-red-500/30 animate-pulse">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Overlay del menú */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Menú lateral */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del menú */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-red to-red-600 text-white">
                <span className="text-base font-bold">S</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Sebastian Escalona</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Menú</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Links principales */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 mb-4">
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Navegación
              </p>
              <ul className="space-y-1">
                {menuLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-brand-red transition-all group"
                      >
                        <Icon className="h-5 w-5 text-slate-400 group-hover:text-brand-red transition-colors" />
                        <span className="font-medium">{link.label}</span>
                        <ChevronRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-brand-red group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Categorías */}
            {categories.length > 0 && (
              <div className="px-3 mb-4">
                <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Categorías
                </p>
                <ul className="space-y-1">
                  {categories.slice(0, 6).map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/catalogo?category=${category.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-brand-red transition-all group"
                      >
                        <Package className="h-4 w-4 text-slate-400 group-hover:text-brand-red transition-colors" />
                        <span className="text-sm">{category.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          {/* Footer del menú */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Phone className="h-4 w-4" />
              <span>¿Necesitas ayuda?</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Contáctanos por WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Modal de búsqueda */}
      <div
        className={`fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 transition-all duration-300 ${
          isSearchOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSearchOpen(false)}
        />
        <div
          className={`relative w-full max-w-xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
            isSearchOpen ? "translate-y-0 scale-100" : "-translate-y-8 scale-95"
          }`}
        >
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-12 py-4 text-lg rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-brand-red/20"
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Cerrar búsqueda"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </form>
          <div className="px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Enter</kbd> para buscar o <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Esc</kbd> para cerrar
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
