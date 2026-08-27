"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { trackEvent } from "@/lib/ga";
import type { Order, OrderItem } from "@/lib/types";

export function PurchaseTracker({ order, items }: { order: Order; items: OrderItem[] }) {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    trackEvent({
      name: "purchase",
      params: {
        transaction_id: order.id,
        currency: "NGN",
        value: order.subtotal,
        items: items.map((item) => ({
          item_id: item.product_variant_id,
          item_name: item.variant?.product?.name ?? "Item",
          price: item.unit_price,
          quantity: item.quantity,
        })),
      },
    });
    clear();
    // Runs once when the confirmed success page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  return null;
}
