import { Menu, Search, ShoppingBag } from "lucide-react";

export default function Header() {
  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
          <Menu className="h-5 w-5 text-black" />
        </button>
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-red text-white">
            <span className="text-sm font-bold">S</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold uppercase tracking-[0.18em] text-black">
              Sebastian Escalona
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
            <Search className="h-5 w-5 text-black" />
          </button>
          <button className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
            <ShoppingBag className="h-5 w-5 text-black" />
            <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-brand-red text-[10px] font-bold text-white">
              2
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
