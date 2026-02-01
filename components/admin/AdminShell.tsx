"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  LogOut,
  Store,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export default function AdminShell({ title, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin/login");
        return;
      }
      setUserEmail(data.session.user.email ?? null);
      setLoading(false);
    };

    loadSession();
  }, [router]);

  // Cerrar sidebar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Bloquear scroll cuando sidebar está abierto en móvil
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-red to-red-600 animate-pulse" />
          <p className="text-sm text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Productos", icon: Package },
    { href: "/admin/categories", label: "Categorías", icon: FolderOpen },
    { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Overlay móvil */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-red to-red-600 text-white shadow-lg shadow-red-500/25">
                <span className="text-base font-bold">S</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Sebastian</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Admin Panel
                </p>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Menu Principal
            </p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        isActive
                          ? "bg-brand-red text-white shadow-lg shadow-red-500/25"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Usuario y acciones */}
          <div className="p-3 border-t border-slate-100">
            <div className="px-3 py-2 mb-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Usuario
              </p>
              <p className="text-sm font-medium text-slate-700 truncate mt-1">
                {userEmail}
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors group"
            >
              <Store className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
              <span className="text-sm font-medium">Ver Tienda</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors group mt-1"
            >
              <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-600" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="lg:pl-72">
        {/* Header móvil */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-red to-red-600 text-white">
                <span className="text-xs font-bold">S</span>
              </div>
              <span className="text-sm font-bold text-slate-900">Admin</span>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Header desktop */}
        <header className="hidden lg:block sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">
                Panel Admin
              </p>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400">Sesión activa</p>
                <p className="text-sm font-medium text-slate-700">{userEmail}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-red to-red-600 grid place-items-center text-white font-bold">
                {userEmail?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Título móvil */}
        <div className="lg:hidden px-4 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">
            Panel Admin
          </p>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        </div>

        {/* Contenido */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
