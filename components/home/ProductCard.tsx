/* eslint-disable @next/next/no-img-element */
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
    badge?.toLowerCase() === "hot"
      ? "bg-brand-red text-white"
      : "bg-black text-white";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      {badge ? (
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${badgeClass}`}
        >
          {badge}
        </span>
      ) : null}
      <Link
        href={`/producto/${slug}`}
        className="mt-6 flex items-center justify-center rounded-2xl bg-slate-50 p-4"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-40 w-40 object-contain"
          />
        ) : (
          <div className="h-40 w-40 rounded-2xl bg-slate-200" />
        )}
      </Link>
      <div className="mt-4 space-y-2">
        <Link href={`/producto/${slug}`}>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-yellow-400">?</span>
          <span>{rating}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {oldPrice ? (
              <p className="text-xs text-slate-400 line-through">{oldPrice}</p>
            ) : null}
            <p className="text-base font-semibold text-brand-red">{price}</p>
          </div>
          <Link
            href={`/producto/${slug}`}
            aria-label={`Ver ${name}`}
            className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"
          >
            +
          </Link>
        </div>
      </div>
    </div>
  );
}

