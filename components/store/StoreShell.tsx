import BottomNav from "@/components/home/BottomNav";
import Header from "@/components/home/Header";
import TopBar from "@/components/home/TopBar";
import WhatsAppButton from "@/components/home/WhatsAppButton";

interface StoreShellProps {
  children: React.ReactNode;
}

export default function StoreShell({ children }: StoreShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <TopBar />
      <Header />
      <main className="space-y-8 pb-28">{children}</main>
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
