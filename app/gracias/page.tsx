import { Suspense } from "react";
import StoreShell from "@/components/store/StoreShell";
import GraciasClient from "./GraciasClient";

export default function GraciasPage() {
  return (
    <StoreShell>
      <Suspense
        fallback={
          <section className="mx-auto w-full max-w-4xl px-6 pt-6 text-center">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-slate-600">Cargando pedido...</p>
            </div>
          </section>
        }
      >
        <GraciasClient />
      </Suspense>
    </StoreShell>
  );
}
