import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price ?? product.base_price))
    : product.base_price;
  const inStock = product.variants?.some((v) => v.stock_quantity > 0) ?? true;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-bg-soft">
        {image && (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-display text-lg text-ink">{product.name}</h3>
        <p className="text-sm text-ink-soft">{product.category?.name}</p>
        <p className="mt-1 font-medium text-mauve-deep">{formatNaira(lowestPrice)}</p>
      </div>
    </Link>
  );
}
