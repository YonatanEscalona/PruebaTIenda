interface BrandsSectionProps {
  brands: string[];
}

export default function BrandsSection({ brands }: BrandsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
        Marcas oficiales
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-lg font-semibold uppercase text-slate-400">
        {brands.map((brand) => (
          <span key={brand}>{brand}</span>
        ))}
      </div>
    </section>
  );
}
