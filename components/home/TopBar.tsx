"use client";

import { useState, useEffect } from "react";
import { Bolt, Truck, Shield, X } from "lucide-react";

const promos = [
  { icon: Bolt, text: "Envíos gratis en compras sobre $50.000", color: "text-yellow-400" },
  { icon: Truck, text: "Entregas en 24-48 horas", color: "text-emerald-400" },
  { icon: Shield, text: "Garantía de satisfacción", color: "text-blue-400" },
];

export default function TopBar() {
  const [currentPromo, setCurrentPromo] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const promo = promos[currentPromo];
  const Icon = promo.icon;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] relative">
        <div
          key={currentPromo}
          className="flex items-center gap-2 animate-fade-in"
        >
          <Icon className={`h-4 w-4 ${promo.color}`} />
          <span>{promo.text}</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Cerrar barra"
        >
          <X className="h-3.5 w-3.5 text-white/60" />
        </button>
      </div>
      {/* Indicadores de promo */}
      <div className="flex justify-center gap-1.5 pb-1.5">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPromo(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentPromo ? "w-4 bg-white" : "w-1 bg-white/30"
            }`}
            aria-label={`Ver promoción ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
