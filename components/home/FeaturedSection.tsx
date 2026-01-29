import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
  slug: string;
  name: string;
  price: string;
  oldPrice?: string;
  rating: number;
  image: string;
  badge?: string;
}

interface FeaturedSectionProps {
  products: Product[];
}

export default function FeaturedSection({ products }: FeaturedSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
            Lo mas vendido
          </p>
          <h2 className="mt-2 text-2xl font-bold uppercase italic text-black">
            Productos
            <br />
            destacados
          </h2>
        </div>
        <Link
          href="/catalogo"
          aria-label="Ver catalogo completo"
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white"
        >
          <SlidersHorizontal className="h-4 w-4 text-slate-600" />
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-black/5">
          Aun no hay productos destacados.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      )}
    </section>
  );
}
