"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { effectivePrice } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { trackEvent } from "@/lib/ga";
import { WishlistButton } from "@/components/product/WishlistButton";

export function ProductDetail({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const addLine = useCartStore((s) => s.addLine);
  const [added, setAdded] = useState(false);

  const price = variant ? effectivePrice(product, variant) : product.base_price;
  const inStock = (variant?.stock_quantity ?? 0) > 0;

  useEffect(() => {
    if (!variant) return;
    trackEvent({
      name: "view_item",
      params: {
        currency: "NGN",
        value: price,
        items: [{ item_id: variant.id, item_name: product.name, price }],
      },
    });
    // Fire once per product view, not on every variant re-select.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  function handleAddToCart() {
    if (!variant || !inStock) return;
    addLine(
      {
        variantId: variant.id,
        productSlug: product.slug,
        productName: product.name,
        sizeLabel: variant.size_label,
        unitPrice: price,
        imageUrl: product.images?.[0]?.url ?? null,
        stockQuantity: variant.stock_quantity,
      },
      1
    );
    trackEvent({
      name: "add_to_cart",
      params: { currency: "NGN", value: price, items: [{ item_id: variant.id, item_name: product.name, price }] },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      <p className="eyebrow text-mauve">{product.category?.name}</p>
      <h1 className="font-display mt-2 text-4xl text-ink">{product.name}</h1>
      <p className="mt-3 text-2xl font-medium text-mauve-deep">{formatNaira(price)}</p>

      {variants.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow text-ink-soft">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  v.id === variantId ? "border-mauve-deep bg-mauve-deep text-white" : "border-border text-ink-soft"
                } ${v.stock_quantity === 0 ? "opacity-50" : ""}`}
              >
                {v.size_label}
                {v.stock_quantity === 0 && " (Out of stock)"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="rounded-full bg-mauve-deep px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-mauve-deep-2 disabled:cursor-not-allowed disabled:bg-ink-soft/40"
        >
          {inStock ? (added ? "Added to Cart ✓" : "Add to Cart") : "Out of Stock"}
        </button>
        {variant && <WishlistButton variantId={variant.id} />}
      </div>

      {product.scent_notes && (
        <div className="mt-10 border-t border-border pt-6">
          <p className="eyebrow text-ink-soft">Scent Notes</p>
          <p className="mt-2 text-ink-soft">{product.scent_notes}</p>
        </div>
      )}

      {product.usage_instructions && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="eyebrow text-ink-soft">How to Use</p>
          <p className="mt-2 text-ink-soft">{product.usage_instructions}</p>
        </div>
      )}
    </div>
  );
}
