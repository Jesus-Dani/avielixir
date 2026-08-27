import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SignOutButton } from "@/components/account/SignOutButton";
import { RemoveWishlistButton } from "@/components/account/RemoveWishlistButton";
import { formatNaira } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const [{ data: customer }, { data: orders }, { data: wishlist }] = await Promise.all([
    supabase.from("customer").select("*").eq("id", user.id).single(),
    supabase
      .from("order")
      .select("*, items:order_item(*, variant:product_variant_id(*, product:product_id(name, slug)))")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("wishlist")
      .select("*, variant:product_variant_id(*, product:product_id(name, slug, images:product_image(url, sort_order)))")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">My Account</h1>
        <SignOutButton />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">Profile</h2>
        <div className="mt-4 max-w-md">
          <ProfileForm
            customerId={user.id}
            initialName={customer?.name ?? ""}
            initialPhone={customer?.phone ?? ""}
            initialAddress={customer?.saved_address ?? ""}
          />
        </div>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-xl text-ink">Order History</h2>
        {!orders || orders.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">You haven&rsquo;t placed any orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-ink-soft">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="eyebrow rounded-full bg-bg-soft px-3 py-1 text-mauve-deep">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-ink-soft">
                  {order.items?.map((item: { id: string; variant?: { product?: { name?: string }; size_label?: string }; quantity: number }) => (
                    <li key={item.id}>
                      {item.variant?.product?.name} ({item.variant?.size_label}) × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-medium text-ink">{formatNaira(order.subtotal)}</p>
                {order.status !== "pending_payment" && order.status !== "cancelled" && (
                  <p className="mt-1 text-xs text-ink-soft">
                    Delivery is arranged separately: we&rsquo;ll reach out about your delivery fee and timing.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-xl text-ink">Wishlist</h2>
        {!wishlist || wishlist.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Nothing saved yet. Tap the heart on any product size to save it here.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {wishlist.map((w) => {
              const variant = w.variant as { product?: { slug?: string; name?: string; images?: { url: string; sort_order: number }[] }; size_label?: string; price?: number | null } | null;
              const product = variant?.product;
              const image = product?.images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0];
              return (
                <div key={w.id} className="rounded-md border border-border p-3">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-bg-soft">
                    {image && <Image src={image.url} alt={product?.name ?? ""} fill sizes="150px" className="object-cover" />}
                  </div>
                  <Link href={`/product/${product?.slug}`} className="mt-2 block text-sm font-medium text-ink hover:text-mauve-deep">
                    {product?.name}
                  </Link>
                  <p className="text-xs text-ink-soft">{variant?.size_label}</p>
                  <div className="mt-2">
                    <RemoveWishlistButton wishlistId={w.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
