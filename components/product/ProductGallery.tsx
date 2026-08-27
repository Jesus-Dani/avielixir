"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const [active, setActive] = useState(0);
  const current = sorted[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-bg-soft">
        {current && (
          <Image src={current.url} alt={productName} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
        )}
      </div>
      {sorted.length > 1 && (
        <div className="mt-4 flex gap-3">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border ${i === active ? "border-mauve-deep" : "border-border"}`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
