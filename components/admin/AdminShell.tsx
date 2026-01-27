"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export default function AdminShell({ title, children }: AdminShellProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
  };

  if (loading) {
    return <div className="p-8 text-sm">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
              Panel Admin
            </p>
            <h1 className="text-3xl font-bold text-black">{title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              {userEmail}
            </span>
            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600"
            >
              Ver tienda
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Cerrar sesion
            </button>
          </div>
        </div>

        <nav className="flex flex-wrap gap-3">
          {[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/products", label: "Productos" },
            { href: "/admin/categories", label: "Categorias" },
            { href: "/admin/orders", label: "Pedidos" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
