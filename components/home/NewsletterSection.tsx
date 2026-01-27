import { ArrowRight } from "lucide-react";

export default function NewsletterSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="rounded-3xl bg-[#14161d] p-6 text-white shadow-[0_20px_45px_-25px_rgba(15,23,42,0.7)]">
        <h3 className="text-lg font-semibold">Unete al Club Sebastian Escalona</h3>
        <p className="mt-2 text-sm text-white/70">
          Recibe ofertas exclusivas y novedades antes que nadie.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-3">
          <input
            className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
            placeholder="Tu email"
            type="email"
          />
          <button className="grid h-9 w-9 place-items-center rounded-full bg-brand-red">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
