import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateOrderStatus } from "@/lib/admin-actions";
import { formatNaira } from "@/lib/format";

const STATUSES = ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("order")
    .select("*, customer:customer_id(name, phone), items:order_item(*, variant:product_variant_id(*, product:product_id(name)))")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-ink">Order #{order.id.slice(0, 8)}</h1>

      <div className="mt-6 rounded-md border border-border p-5">
        <p className="text-sm text-ink-soft">Customer</p>
        <p className="text-ink">{order.customer?.name ?? order.guest_email ?? "Guest"}</p>
        {order.delivery_phone_note && <p className="mt-1 text-sm text-ink-soft">Phone / delivery note: {order.delivery_phone_note}</p>}
      </div>

      <ul className="mt-6 divide-y divide-border border-y border-border">
        {(order.items ?? []).map((item: { id: string; variant?: { product?: { name?: string }; size_label?: string }; quantity: number; unit_price: number }) => (
          <li key={item.id} className="flex justify-between py-3 text-sm">
            <span>{item.variant?.product?.name} ({item.variant?.size_label}) × {item.quantity}</span>
            <span>{formatNaira(item.unit_price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 font-medium text-ink">Subtotal: {formatNaira(order.subtotal)}</p>
      <p className="text-xs text-ink-soft">Delivery fee is arranged separately and is not part of this checkout total.</p>

      <form action={updateOrderStatus} className="mt-8 flex items-center gap-3">
        <input type="hidden" name="id" value={order.id} />
        <select name="status" defaultValue={order.status} className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-mauve-deep px-5 py-2 text-sm text-white hover:bg-mauve-deep-2">
          Update Status
        </button>
      </form>
    </div>
  );
}
