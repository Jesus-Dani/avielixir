import { formatNaira } from "@/lib/format";
import type { CartLine } from "@/lib/cart-store";

export function whatsappLink(message?: string) {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildOrderWhatsAppMessage(params: {
  orderId: string;
  lines: Pick<CartLine, "productName" | "sizeLabel" | "quantity">[];
  subtotal: number;
  address: string;
}) {
  const itemLines = params.lines
    .map((l) => `- ${l.productName} (${l.sizeLabel}) x${l.quantity}`)
    .join("\n");

  return [
    `Hi Avi Elixir! I just made a bank transfer for my order #${params.orderId.slice(0, 8)}.`,
    "",
    "Items:",
    itemLines,
    "",
    `Total: ${formatNaira(params.subtotal)}`,
    `Delivery address: ${params.address}`,
    "",
    "I've uploaded my payment receipt on the site. Attaching a screenshot here too.",
  ].join("\n");
}
