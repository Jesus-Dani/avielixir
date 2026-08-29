import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/format";
import { getBankDetails } from "@/lib/bank-details";
import { whatsappLink, buildOrderWhatsAppMessage } from "@/lib/whatsapp";
import { OrderPlacedTracker } from "@/components/cart/OrderPlacedTracker";
import { OrderItemsList } from "@/components/order/OrderItemsList";

export default async function CheckoutConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin.from("order").select("*").eq("id", orderId).single();
  const { data: items } = await admin
    .from("order_item")
    .select("*, variant:product_variant_id(*, product:product_id(name, slug))")
    .eq("order_id", orderId);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">We couldn&rsquo;t find that order</h1>
        <Link href="/shop" className="mt-6 inline-block text-mauve-deep underline">Return to shop</Link>
      </div>
    );
  }

  let address = "";
  if (order.customer_id) {
    const { data: customer } = await admin.from("customer").select("saved_address").eq("id", order.customer_id).single();
    address = customer?.saved_address ?? "";
  }

  const bank = getBankDetails();
  const waMessage = buildOrderWhatsAppMessage({
    orderId: order.id,
    lines: (items ?? []).map((item) => ({
      productName: item.variant?.product?.name ?? "Item",
      sizeLabel: item.variant?.size_label ?? "",
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    address,
  });
  const waHref = whatsappLink(waMessage);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <OrderPlacedTracker />
      <h1 className="font-display text-3xl text-ink">Order Received</h1>
      <p className="mt-3 text-ink-soft">
        We&rsquo;ve saved your order (#{order.id.slice(0, 8)}) and your receipt. Message us on WhatsApp so we can
        confirm your payment and get your order moving.
      </p>

      <div className="mt-8 rounded-md bg-bg-soft p-5">
        <p className="eyebrow text-mauve">Bank Transfer Details</p>
        <dl className="mt-2 space-y-1 text-sm text-ink">
          <div className="flex justify-between"><dt className="text-ink-soft">Bank</dt><dd>{bank.bankName}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Account Number</dt><dd className="font-medium">{bank.accountNumber}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Account Name</dt><dd>{bank.accountName}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Amount</dt><dd className="font-medium">{formatNaira(order.subtotal)}</dd></div>
        </dl>
      </div>

      <div className="mt-6 rounded-md border border-border p-5">
        <p className="font-medium text-ink">Delivery is arranged separately</p>
        <p className="mt-1 text-sm text-ink-soft">
          This order total covers products only. Avi Elixir will contact you by phone or WhatsApp to confirm your
          delivery address and delivery fee.
        </p>
      </div>

      <OrderItemsList items={items ?? []} className="mt-8" />

      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Message Us on WhatsApp
        </a>
      )}
      <p className="mt-2 text-xs text-ink-soft">
        Your receipt is already saved with your order. Please also attach the screenshot in the WhatsApp chat so we
        can verify it quickly.
      </p>

      <Link href="/shop" className="mt-6 inline-block rounded-full border border-border px-8 py-3 text-center text-sm text-ink-soft hover:border-mauve-deep">
        Continue Shopping
      </Link>
    </div>
  );
}
