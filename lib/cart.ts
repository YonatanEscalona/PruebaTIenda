import type { Product } from "./products";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CART_KEY = "se_cart";

const isBrowser = () => typeof window !== "undefined";

export const readCart = (): CartItem[] => {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeCart = (items: CartItem[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const addToCart = (product: Product, quantity = 1) => {
  if (!isBrowser()) return [] as CartItem[];
  const items = readCart();
  const existing = items.find((item) => item.slug === product.slug);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
  }
  writeCart(items);
  return items;
};

export const updateQuantity = (slug: string, quantity: number) => {
  if (!isBrowser()) return [] as CartItem[];
  const items = readCart()
    .map((item) =>
      item.slug === slug ? { ...item, quantity } : item
    )
    .filter((item) => item.quantity > 0);
  writeCart(items);
  return items;
};

export const removeFromCart = (slug: string) => {
  if (!isBrowser()) return [] as CartItem[];
  const items = readCart().filter((item) => item.slug !== slug);
  writeCart(items);
  return items;
};

export const clearCart = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CART_KEY);
};

export const cartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const itemsCount = items.reduce((total, item) => total + item.quantity, 0);
  return { subtotal, itemsCount };
};
