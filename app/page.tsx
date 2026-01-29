export const dynamic = "force-dynamic";

import {
  Grid2x2,
  Headphones,
  Home as HomeIcon,
  Laptop,
  Lightbulb,
  Package,
  Smartphone,
} from "lucide-react";
import BottomNav from "@/components/home/BottomNav";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import TopBar from "@/components/home/TopBar";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import { formatCurrency } from "@/lib/format";
import { fetchProducts } from "@/lib/products-data";
import { fetchCategories } from "@/lib/categories-data";

const defaultCategories = [
  { label: "Hogar", icon: HomeIcon },
  { label: "Tecnologia", icon: Laptop },
  { label: "Celulares", icon: Smartphone },
  { label: "Audio", icon: Headphones },
  { label: "Iluminacion", icon: Lightbulb },
  { label: "Accesorios", icon: Package },
];

const iconMap: Record<string, typeof Grid2x2> = {
  hogar: HomeIcon,
  casa: HomeIcon,
  tecnologia: Laptop,
  "tecnologia-y-computacion": Laptop,
  computacion: Laptop,
  informatica: Laptop,
  celulares: Smartphone,
  telefonia: Smartphone,
  audio: Headphones,
  sonido: Headphones,
  iluminacion: Lightbulb,
  luces: Lightbulb,
  accesorios: Package,
  otros: Package,
};

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
    slug: product.slug,
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
      </main>
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
