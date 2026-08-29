"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { useMounted } from "@/lib/use-mounted";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const subtotal = useCartStore((s) => s.subtotal());
  const mounted = useMounted();

  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl text-ink">Your cart is empty</h1>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-mauve-deep px-8 py-3 text-sm text-white hover:bg-mauve-deep-2">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-ink">Your Cart</h1>

      <div className="mt-8 divide-y divide-border border-y border-border">
        {lines.map((line) => (
          <div key={line.variantId} className="flex items-center gap-4 py-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-bg-soft">
              {line.imageUrl && <Image src={line.imageUrl} alt={line.productName} fill sizes="80px" className="object-cover" />}
            </div>
            <div className="flex-1">
              <Link href={`/product/${line.productSlug}`} className="font-display text-ink hover:text-mauve-deep">
                {line.productName}
              </Link>
              <p className="text-sm text-ink-soft">{line.sizeLabel}</p>
              <p className="mt-1 text-sm font-medium text-mauve-deep">{formatNaira(line.unitPrice)}</p>
            </div>
            <input
              type="number"
              min={1}
              max={line.stockQuantity}
              value={line.quantity}
              onChange={(e) => setQuantity(line.variantId, Math.min(Number(e.target.value) || 1, line.stockQuantity))}
              className="w-16 rounded-md border border-border px-2 py-1 text-center text-sm"
            />
            <button onClick={() => removeLine(line.variantId)} className="text-sm text-ink-soft hover:text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-soft">Subtotal (delivery arranged separately)</p>
          <p className="font-display text-2xl text-ink">{formatNaira(subtotal)}</p>
        </div>
        <Link href="/checkout" className="rounded-full bg-mauve-deep px-8 py-3 text-sm font-medium text-white hover:bg-mauve-deep-2">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
