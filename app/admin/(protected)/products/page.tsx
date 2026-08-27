import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { toggleFeatured } from "@/lib/admin-actions";
import { formatNaira } from "@/lib/format";

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("product")
    .select("*, category:category_id(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-mauve-deep px-5 py-2 text-sm text-white hover:bg-mauve-deep-2">
          + New Product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-soft">
              <th className="py-2">Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Price</th>
              <th className="py-2">Status</th>
              <th className="py-2">Featured</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="py-3">{p.name}</td>
                <td className="py-3 text-ink-soft">{p.category?.name}</td>
                <td className="py-3">{formatNaira(p.base_price)}</td>
                <td className="py-3 text-ink-soft">{p.status}</td>
                <td className="py-3">
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="next" value={(!p.is_featured).toString()} />
                    <button type="submit" className={p.is_featured ? "text-gold" : "text-ink-soft"}>
                      {p.is_featured ? "★ Featured" : "☆ Feature"}
                    </button>
                  </form>
                </td>
                <td className="py-3">
                  <Link href={`/admin/products/${p.id}`} className="text-mauve-deep underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
