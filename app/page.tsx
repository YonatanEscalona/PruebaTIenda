export const dynamic = "force-dynamic";
export const runtime = "edge";

import BottomNav from "@/components/home/BottomNav";
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import HomeData from "@/components/home/HomeData";
import TopBar from "@/components/home/TopBar";
import WhatsAppButton from "@/components/home/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <TopBar />
      <Header />
      <main className="space-y-10 pb-28">
        <Hero />
        <HomeData />
      </main>
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
