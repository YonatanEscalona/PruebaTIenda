"use client";

import { CreditCard, Headset, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    title: "Envio express",
    description: "Despachos rapidos y seguimiento en cada compra.",
    icon: Truck,
  },
  {
    title: "Pago seguro",
    description: "Transacciones cifradas y multiples medios de pago.",
    icon: CreditCard,
  },
  {
    title: "Garantia real",
    description: "Soporte postventa y cambios sin fricciones.",
    icon: ShieldCheck,
  },
  {
    title: "Asesoria humana",
    description: "Resolvemos dudas por WhatsApp o correo.",
    icon: Headset,
  },
];

export default function ValueProps() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 animate-[rise_0.6s_ease-out]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.35)]"
            >
              <div className="absolute -right-6 -top-10 h-24 w-24 rounded-full bg-brand-red/10 blur-2xl" />
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-red/10 text-brand-red">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
