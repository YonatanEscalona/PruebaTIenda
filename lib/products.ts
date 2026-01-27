export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  badge?: string;
  image: string;
  shortDescription: string;
  description: string;
  stock: number;
  active?: boolean;
  categoryId?: string | null;
}

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    slug: "parlantes-jbl-stage3-427f",
    name: "Parlantes JBL Stage3 427F",
    category: "Audio",
    price: 64990,
    oldPrice: 80990,
    rating: 4.8,
    badge: "Oferta",
    image: "",
    shortDescription: "Sonido nitido y potente para cualquier setup.",
    description:
      "Kit de parlantes de 2 vias con alta respuesta en bajas frecuencias y materiales premium para durabilidad en ruta.",
    stock: 12,
  },
  {
    id: "prod-2",
    slug: "barra-led-158x44mm-blanca",
    name: "Barra LED 158X44mm Blanca",
    category: "Luces",
    price: 7990,
    rating: 5.0,
    badge: "Hot",
    image: "",
    shortDescription: "Iluminacion intensa y compacta para tu vehiculo.",
    description:
      "Barra LED de alto brillo con proteccion contra humedad y facil montaje. Ideal para ruta y faena.",
    stock: 28,
  },
  {
    id: "prod-3",
    slug: "cubre-pisos-universal-set-x4",
    name: "Cubre Pisos Universal Set x4",
    category: "Exterior",
    price: 13990,
    rating: 4.5,
    image: "",
    shortDescription: "Proteccion total del habitaculo en todo clima.",
    description:
      "Alfombras universales con refuerzo antideslizante y textura antidesgaste para uso diario.",
    stock: 40,
  },
  {
    id: "prod-4",
    slug: "subwoofer-raistar-racing-10",
    name: "Subwoofer Raistar Racing 10\"",
    category: "Audio",
    price: 149990,
    oldPrice: 259990,
    rating: 4.9,
    badge: "Hot",
    image: "",
    shortDescription: "Graves profundos con potencia real.",
    description:
      "Subwoofer de 10 pulgadas con bobina reforzada y respuesta dinamica para un audio contundente.",
    stock: 8,
  },
  {
    id: "prod-5",
    slug: "kit-luces-led-interior",
    name: "Kit Luces LED Interior",
    category: "Luces",
    price: 12990,
    rating: 4.6,
    image: "",
    shortDescription: "Cambio rapido a iluminacion blanca premium.",
    description:
      "Set de ampolletas LED de alta eficiencia con instalacion plug & play.",
    stock: 18,
  },
  {
    id: "prod-6",
    slug: "filtro-de-aire-deportivo",
    name: "Filtro de Aire Deportivo",
    category: "Motor",
    price: 24990,
    rating: 4.7,
    image: "",
    shortDescription: "Mejor flujo de aire y respuesta del motor.",
    description:
      "Filtro lavable de alto flujo que ayuda a mejorar la admision y el rendimiento general.",
    stock: 15,
  },
];

export const getMockProductBySlug = (slug: string) =>
  mockProducts.find((product) => product.slug === slug);
