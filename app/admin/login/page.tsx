"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Configura las variables NEXT_PUBLIC_SUPABASE_URL y ANON_KEY.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Credenciales invalidas.");
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] px-6 py-12">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-bold text-black">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acceso solo para administradores.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@tienda.cl"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-full bg-brand-red px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
