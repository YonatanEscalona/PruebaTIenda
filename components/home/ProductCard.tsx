/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
interface ProductCardProps {
  slug: string;
  name: string;
  price: string;
  oldPrice?: string;
  rating: number;
  image: string;
  badge?: string;
}

export default function ProductCard({
  slug,
  name,
  price,
  oldPrice,
  rating,
  image,
  badge,
}: ProductCardProps) {
  const badgeClass =
    badge?.toLowerCase() === "oferta destacada"
      ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30"
      : badge?.toLowerCase() === "nuevo"
      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30"
      : "bg-black text-white";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl hover:ring-black/10 hover:-translate-y-1">
      {badge ? (
        <span
          className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm ${badgeClass}`}
        >
          {badge}
        </span>
      ) : null}
      <Link
        href={`/producto/${slug}`}
        className="block relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 p-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))]" />
        {image ? (
          <img
            src={image}
            alt={name}
            className="relative h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full rounded-xl bg-slate-200" />
        )}
      </Link>
      <div className="p-4 space-y-3">
        <Link href={`/producto/${slug}`} className="group/title">
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover/title:text-brand-red transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < rating ? "text-yellow-400" : "text-slate-200"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-slate-600">({rating}.0)</span>
        </div>
        <div className="flex items-end justify-between pt-1">
          <div className="space-y-0.5">
            {oldPrice ? (
              <p className="text-xs text-slate-400 line-through">{oldPrice}</p>
            ) : null}
            <p className="text-lg font-bold text-brand-red">{price}</p>
          </div>
          <Link
            href={`/producto/${slug}`}
            aria-label={`Ver ${name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-lg font-light transition-all hover:bg-brand-red hover:scale-110 hover:shadow-lg hover:shadow-red-500/30"
          >
            +
          </Link>
        </div>
      </div>
    </div>
  );
}

