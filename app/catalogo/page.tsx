export const dynamic = "force-dynamic";

import StoreShell from "@/components/store/StoreShell";
import CatalogProducts from "@/components/store/CatalogProducts";

export default function CatalogoPage() {
  return (
    <StoreShell>
      <section className="mx-auto w-full max-w-6xl px-6 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
          Catalogo
        </p>
        <h1 className="mt-2 text-3xl font-bold uppercase italic text-black">
          Todos los productos
        </h1>
        <CatalogProducts />
      </section>
    </StoreShell>
  );
}
