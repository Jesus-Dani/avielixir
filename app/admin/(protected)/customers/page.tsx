import { createAdminClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/format";

export default async function AdminCustomersPage() {
  const supabase = createAdminClient();

  const [{ data: customers }, { data: orders }] = await Promise.all([
    supabase.from("customer").select("*").order("created_at", { ascending: false }),
    supabase.from("order").select("customer_id, subtotal, status").not("status", "in", "(pending_payment,cancelled)"),
  ]);

  const lifetimeValueByCustomer = new Map<string, number>();
  for (const order of orders ?? []) {
    if (!order.customer_id) continue;
    lifetimeValueByCustomer.set(order.customer_id, (lifetimeValueByCustomer.get(order.customer_id) ?? 0) + order.subtotal);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Customers</h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-soft">
              <th className="py-2">Name</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Joined</th>
              <th className="py-2">Lifetime Value</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((c) => (
              <tr key={c.id} className="border-b border-border">
                <td className="py-3">{c.name ?? "N/A"}{c.is_admin && <span className="ml-2 text-xs text-gold">Admin</span>}</td>
                <td className="py-3 text-ink-soft">{c.phone ?? "N/A"}</td>
                <td className="py-3 text-ink-soft">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="py-3 font-medium text-ink">{formatNaira(lifetimeValueByCustomer.get(c.id) ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
