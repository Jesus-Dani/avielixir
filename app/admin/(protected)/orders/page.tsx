import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/format";

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("order")
    .select("*, customer:customer_id(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Orders</h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-soft">
              <th className="py-2">Order</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Subtotal</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-border">
                <td className="py-3">#{o.id.slice(0, 8)}</td>
                <td className="py-3 text-ink-soft">{o.customer?.name ?? o.guest_email ?? "Guest"}</td>
                <td className="py-3">{formatNaira(o.subtotal)}</td>
                <td className="py-3 text-ink-soft">{o.status}</td>
                <td className="py-3 text-ink-soft">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-mauve-deep underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
