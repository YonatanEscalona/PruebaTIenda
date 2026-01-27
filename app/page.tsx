export const dynamic = "force-dynamic";

import { Car, Gauge, Grid2x2, Lightbulb, Speaker } from "lucide-react";
import BrandsSection from "@/components/home/BrandsSection";
import BottomNav from "@/components/home/BottomNav";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import NewsletterSection from "@/components/home/NewsletterSection";
import TopBar from "@/components/home/TopBar";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import { formatCurrency } from "@/lib/format";
import { fetchProducts } from "@/lib/products-data";
import { fetchCategories } from "@/lib/categories-data";

const defaultCategories = [
  { label: "Exterior", icon: Car },
  { label: "Audio", icon: Speaker },
  { label: "Luces", icon: Lightbulb },
  { label: "Motor", icon: Gauge },
];

const iconMap: Record<string, typeof Car> = {
  exterior: Car,
  audio: Speaker,
  luces: Lightbulb,
  motor: Gauge,
};

const brands = ["Sparco", "Momo", "Pioneer", "JBL"];

export default async function Home() {
  const [products, categoriesData] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const categories = categoriesData.length
    ? categoriesData.map((category) => {
        const key = category.slug?.toLowerCase() ?? category.name.toLowerCase();
        const Icon = iconMap[key] ?? Grid2x2;
        return { label: category.name, icon: Icon };
      })
    : defaultCategories;

  const featuredProducts = products.slice(0, 4).map((product) => ({
    name: product.name,
    rating: product.rating,
    price: formatCurrency(product.price),
    oldPrice: product.oldPrice ? formatCurrency(product.oldPrice) : undefined,
    badge: product.badge,
    image: product.image,
  }));

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <TopBar />
      <Header />
      <main className="space-y-10 pb-28">
        <Hero />
        <CategoriesSection categories={categories} />
        <FeaturedSection products={featuredProducts} />
        <BrandsSection brands={brands} />
        <NewsletterSection />
      </main>
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
