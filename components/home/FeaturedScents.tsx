import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function FeaturedScents({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-mauve">Featured Scents</p>
          <h2 className="font-display mt-2 text-3xl text-ink sm:text-4xl">Our Bestsellers</h2>
        </div>
        <Link href="/shop" className="eyebrow hidden text-ink-soft hover:text-mauve-deep sm:inline-flex sm:items-center sm:gap-1">
          View All <span aria-hidden>&rarr;</span>
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
