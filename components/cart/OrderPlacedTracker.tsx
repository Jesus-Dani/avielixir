"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

/** Clears the cart once an order has been placed and is awaiting payment verification. */
export function OrderPlacedTracker() {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
