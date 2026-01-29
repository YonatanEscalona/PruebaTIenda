"use client";

import Link from "next/link";
import {
  ChefHat,
  Gamepad2,
  Home as HomeIcon,
  Speaker,
} from "lucide-react";

const collections = [
  {
    title: "Hogar practico",
    description: "Organizacion, limpieza y cocina en un solo lugar.",
    icon: HomeIcon,
    tone: "from-amber-100/80 via-white to-white",
  },
  {
    title: "Audio & sonido",
    description: "Parlantes, audifonos y experiencias inmersivas.",
    icon: Speaker,
    tone: "from-slate-100 via-white to-white",
  },
  {
    title: "Cocina moderna",
    description: "Utensilios y tecnologia para tu dia a dia.",
    icon: ChefHat,
    tone: "from-rose-100/70 via-white to-white",
  },
  {
    title: "Gaming & tech",
    description: "Accesorios y gadgets para elevar tu setup.",
    icon: Gamepad2,
    tone: "from-indigo-100/70 via-white to-white",
  },
];

export default function CollectionsSection() {
  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 animate-[rise_0.7s_ease-out]"
      style={{ animationDelay: "80ms" }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
            Colecciones
          </p>
          <h2 className="mt-2 text-2xl font-bold uppercase italic text-black">
            Explora por
            <br />
            estilo de vida
          </h2>
        </div>
        <Link
          href="/catalogo"
          className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
        >
          Ver catalogo
        </Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {collections.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href="/catalogo"
              className={`group relative overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-br ${item.tone} p-6 shadow-[0_25px_45px_-30px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5`}
            >
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-brand-red/10 blur-3xl transition group-hover:bg-brand-red/20" />
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-2 max-w-xs text-xs text-slate-500">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
                    Comprar
                  </span>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-black/5">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
