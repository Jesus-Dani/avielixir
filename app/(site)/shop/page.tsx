import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts, getCategories } from "@/lib/queries";

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; min?: string; max?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      search: params.q,
      minPrice: params.min ? Number(params.min) : undefined,
      maxPrice: params.max ? Number(params.max) : undefined,
    }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="eyebrow text-mauve">Shop</p>
      <h1 className="font-display mt-2 text-4xl text-ink">All Scents</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <form className="space-y-6" action="/shop">
            <div>
              <label htmlFor="q" className="eyebrow block text-ink-soft">Search</label>
              <input
                id="q"
                name="q"
                defaultValue={params.q}
                placeholder="Search products"
                className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="eyebrow text-ink-soft">Category</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <Link href="/shop" className={!params.category ? "font-semibold text-mauve-deep" : "text-ink-soft"}>
                    All
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      className={params.category === cat.slug ? "font-semibold text-mauve-deep" : "text-ink-soft"}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="min" className="eyebrow block text-ink-soft">Min ₦</label>
                <input id="min" name="min" type="number" defaultValue={params.min} className="mt-2 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label htmlFor="max" className="eyebrow block text-ink-soft">Max ₦</label>
                <input id="max" name="max" type="number" defaultValue={params.max} className="mt-2 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
              </div>
            </div>
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <button type="submit" className="w-full rounded-full bg-mauve-deep px-4 py-2 text-sm text-white hover:bg-mauve-deep-2">
              Apply Filters
            </button>
          </form>
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <p className="text-ink-soft">No products match these filters yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
