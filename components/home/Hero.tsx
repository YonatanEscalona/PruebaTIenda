import Link from "next/link";
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
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-10 pt-12">
        <span className="w-fit rounded-full bg-brand-red px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
          Novedades del mes
        </span>
        <h1 className="font-display text-4xl uppercase leading-[1.05] tracking-[0.08em] sm:text-5xl">
          Todo para tu hogar,
          <br />
          tecnologia y mucho mas
        </h1>
        <p className="max-w-md text-sm text-white/80 sm:text-base">
          Seleccion premium con entrega rapida y precios justos.
        </p>
        <Link
          href="/catalogo"
          className="mt-2 w-full max-w-xs rounded-full bg-brand-red px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-[0_18px_40px_-18px_rgba(239,68,68,0.85)]"
        >
          Ver catalogo
        </Link>
      </div>
    </section>
  );
}
