import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Truck, Wallet } from "lucide-react";
import { SITE } from "@/lib/site";

export default function Hero() {
  const heroImage = SITE.heroImageUrl;

  return (
    <section className="relative overflow-hidden rounded-b-[36px] bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/85" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-6 pb-12 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-5">
          <span className="w-fit rounded-full bg-brand-red px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Novedades del mes
          </span>
          <h1 className="font-display text-4xl uppercase leading-[1.05] tracking-[0.08em] sm:text-5xl">
            Todo para tu hogar,
            <br />
            tecnologia y mucho mas
          </h1>
          <p className="max-w-md text-sm text-white/80 sm:text-base">
            Seleccion premium con entrega rapida, pagos seguros y soporte real
            en todo momento.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="w-full max-w-xs rounded-full bg-brand-red px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-[0_18px_40px_-18px_rgba(239,68,68,0.85)] sm:w-auto"
            >
              Ver catalogo
            </Link>
            <Link
              href="#ofertas"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/90"
            >
              Ofertas de hoy
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {[
              { label: "Envio rapido", icon: Truck },
              { label: "Pago protegido", icon: Wallet },
              { label: "Garantia real", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
                >
                  <Icon className="h-4 w-4 text-brand-red" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-red/40 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Seleccion destacada
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Combos hogar + tecnologia
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Productos esenciales para tu espacio con envio express.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Explorar ahora
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
