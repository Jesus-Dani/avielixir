"use client";

import { useState } from "react";

interface Row {
  key: number;
  sizeLabel: string;
  price: string;
  stockQuantity: string;
}

let nextKey = 1;

export function VariantRowsInput() {
  const [rows, setRows] = useState<Row[]>([{ key: nextKey++, sizeLabel: "", price: "", stockQuantity: "0" }]);

  function updateRow(key: number, field: keyof Row, value: string) {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((r) => [...r, { key: nextKey++, sizeLabel: "", price: "", stockQuantity: "0" }]);
  }

  function removeRow(key: number) {
    setRows((r) => (r.length > 1 ? r.filter((row) => row.key !== key) : r));
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={row.key} className="flex flex-wrap items-center gap-2">
          <input
            name="size_label[]"
            placeholder="e.g. 50ml"
            required
            value={row.sizeLabel}
            onChange={(e) => updateRow(row.key, "sizeLabel", e.target.value)}
            className="w-24 rounded-md border border-border bg-surface px-2 py-1 text-sm"
          />
          <input
            name="price[]"
            type="number"
            placeholder="Price (₦)"
            required
            min="0"
            value={row.price}
            onChange={(e) => updateRow(row.key, "price", e.target.value)}
            className="w-28 rounded-md border border-border bg-surface px-2 py-1 text-sm"
          />
          <input
            name="stock_quantity[]"
            type="number"
            placeholder="Stock"
            value={row.stockQuantity}
            onChange={(e) => updateRow(row.key, "stockQuantity", e.target.value)}
            className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm"
          />
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              aria-label={`Remove size row ${i + 1}`}
              className="text-xs text-red-600"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="rounded-full border border-border px-4 py-1 text-xs text-ink-soft hover:border-mauve-deep"
      >
        + Add Another Size
      </button>
    </div>
  );
}
