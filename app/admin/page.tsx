import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ count: products }, { count: orders }, { count: pendingReviews }, { count: customers }] = await Promise.all([
    supabase.from("product").select("id", { count: "exact", head: true }),
    supabase.from("order").select("id", { count: "exact", head: true }),
    supabase.from("review").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("customer").select("id", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Products", value: products ?? 0, href: "/admin/products" },
    { label: "Orders", value: orders ?? 0, href: "/admin/orders" },
    { label: "Pending Reviews", value: pendingReviews ?? 0, href: "/admin/reviews" },
    { label: "Customers", value: customers ?? 0, href: "/admin/customers" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-md border border-border p-5 hover:border-mauve-deep">
            <p className="text-3xl font-semibold text-ink">{card.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
