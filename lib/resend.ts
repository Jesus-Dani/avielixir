import { Resend } from "resend";
import type { Order, OrderItem } from "@/lib/types";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export async function sendOrderConfirmationEmail(order: Order, items: OrderItem[], email: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:4px 8px">${item.variant?.product?.name ?? "Item"} — ${item.variant?.size_label ?? ""} × ${item.quantity}</td><td style="padding:4px 8px;text-align:right">${formatNaira(item.unit_price * item.quantity)}</td></tr>`
    )
    .join("");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: email,
    subject: `Avi Elixir — order confirmed (#${order.id.slice(0, 8)})`,
    html: `
      <div style="font-family:sans-serif;color:#1c1512">
        <h1 style="font-size:20px">Thank you for your order</h1>
        <p>We've received your payment of <strong>${formatNaira(order.subtotal)}</strong>. Here's what you ordered:</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="margin-top:16px">
          <strong>Delivery is arranged separately.</strong> Avi Elixir will reach out to you by phone or WhatsApp
          to confirm your delivery address and delivery fee — this order total does not include delivery.
        </p>
        <p>If you have any questions, message us on WhatsApp any time.</p>
      </div>
    `,
  });
}
