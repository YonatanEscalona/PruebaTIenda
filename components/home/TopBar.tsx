import { Bolt } from "lucide-react";

export default function TopBar() {
  return (
    <div className="bg-black text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
        <Bolt className="h-3.5 w-3.5 text-yellow-400" />
        <span>Envios gratis en compras sobre $50.000</span>
      </div>
    </div>
  );
}
