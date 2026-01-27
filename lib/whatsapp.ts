import type { CartItem } from "./cart";
import { formatCurrency } from "./format";

interface OrderPayload {
  code: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
  total: number;
}

export const buildWhatsAppMessage = (order: OrderPayload) => {
  const lines = [
    `Pedido ${order.code}`,
    `Nombre: ${order.name}`,
    `Telefono: ${order.phone}`,
    `Direccion: ${order.address}`,
  ];

  if (order.notes) {
    lines.push(`Notas: ${order.notes}`);
  }

  lines.push("---");
  order.items.forEach((item) => {
    lines.push(`${item.quantity}x ${item.name}`);
  });
  lines.push("---");
  lines.push(`Total: ${formatCurrency(order.total)}`);

  return lines.join("\n");
};

export const buildWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
