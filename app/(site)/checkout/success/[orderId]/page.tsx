import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/format";
import { PurchaseTracker } from "@/components/cart/PurchaseTracker";

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
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

  const paid = order.status !== "pending_payment";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {paid && <PurchaseTracker order={order} items={items ?? []} />}
      <h1 className="font-display text-3xl text-ink">
        {paid ? "Thank you for your order!" : "Payment pending"}
      </h1>
      <p className="mt-3 text-ink-soft">
        {paid
          ? `We've received your payment of ${formatNaira(order.subtotal)}.`
          : "We haven't received confirmation of your payment yet. If you completed payment, this will update shortly."}
      </p>

      <div className="mt-8 rounded-md bg-bg-soft p-5">
        <p className="font-medium text-ink">Delivery is arranged separately</p>
        <p className="mt-1 text-sm text-ink-soft">
          This order total covers products only. Avi Elixir will contact you by phone or WhatsApp to confirm your
          delivery address and delivery fee.
        </p>
      </div>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {(items ?? []).map((item) => (
          <li key={item.id} className="flex justify-between py-3 text-sm">
            <span>
              {item.variant?.product?.name} ({item.variant?.size_label}) × {item.quantity}
            </span>
            <span>{formatNaira(item.unit_price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <Link href="/shop" className="mt-8 inline-block rounded-full bg-mauve-deep px-8 py-3 text-sm text-white hover:bg-mauve-deep-2">
        Continue Shopping
      </Link>
    </div>
  );
}
