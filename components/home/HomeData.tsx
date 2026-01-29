"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Grid2x2,
  Headphones,
  Home as HomeIcon,
  Laptop,
  Lightbulb,
  Package,
  Smartphone,
} from "lucide-react";
import CategoriesSection from "@/components/home/CategoriesSection";
import CollectionsSection from "@/components/home/CollectionsSection";
import DealSpotlight from "@/components/home/DealSpotlight";
import FeaturedSection from "@/components/home/FeaturedSection";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/products";

interface Category {
  id: string;
  name: string;
  slug: string;
}

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

const normalizeCategoryKey = (category: Category) =>
  category.slug?.toLowerCase() ?? category.name.toLowerCase();

export default function HomeData() {
  const [categories, setCategories] = useState(defaultCategories);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/public/products"),
          fetch("/api/public/categories"),
        ]);

        if (!productsRes.ok) {
          throw new Error("No se pudieron cargar los productos.");
        }
        if (!categoriesRes.ok) {
          throw new Error("No se pudieron cargar las categorias.");
        }

        const productsData = (await productsRes.json()) as Product[];
        const categoriesData = (await categoriesRes.json()) as Category[];

        if (!active) return;

        setProducts(Array.isArray(productsData) ? productsData : []);
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          const mapped = categoriesData.map((category) => {
            const key = normalizeCategoryKey(category);
            const Icon = iconMap[key] ?? Grid2x2;
            return { label: category.name, icon: Icon };
          });
          setCategories(mapped);
        } else {
          setCategories(defaultCategories);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Error cargando datos.");
        setProducts([]);
        setCategories(defaultCategories);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const featuredProducts = useMemo(
    () =>
      products.slice(0, 4).map((product) => ({
        slug: product.slug,
        name: product.name,
        rating: product.rating,
        price: formatCurrency(product.price),
        oldPrice: product.oldPrice ? formatCurrency(product.oldPrice) : undefined,
        badge: product.badge,
        image: product.image,
      })),
    [products]
  );

  const latestProducts = useMemo(() => {
    const selected = products.slice(4, 10);
    const source = selected.length > 0 ? selected : products.slice(0, 6);
    return source.map((product) => ({
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      price: formatCurrency(product.price),
      oldPrice: product.oldPrice ? formatCurrency(product.oldPrice) : undefined,
      badge: product.badge,
      image: product.image,
    }));
  }, [products]);

  const dealProduct = useMemo(() => {
    const withDiscount = products.find(
      (product) =>
        typeof product.oldPrice === "number" &&
        product.oldPrice > 0 &&
        product.oldPrice > product.price
    );
    return withDiscount ?? products[0] ?? null;
  }, [products]);

  return (
    <>
      <CategoriesSection categories={categories} />
      <CollectionsSection />
      {loading ? (
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-40 rounded-3xl bg-white/70 shadow-sm ring-1 ring-black/5"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <DealSpotlight product={dealProduct} />
          <FeaturedSection
            products={featuredProducts}
            description="Seleccion curada con lo mas vendido del momento."
          />
          <FeaturedSection
            products={latestProducts}
            eyebrow="Recien llegados"
            title="Nuevas colecciones"
            description="Descubre lo ultimo en hogar, tecnologia y audio."
            emptyMessage="Aun no hay nuevas colecciones publicadas."
          />
        </>
      )}
      {error ? (
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      ) : null}
    </>
  );
}
