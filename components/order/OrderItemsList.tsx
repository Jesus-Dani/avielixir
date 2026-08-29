import { formatNaira } from "@/lib/format";

interface OrderItemLike {
  id: string;
  quantity: number;
  unit_price: number;
  variant?: { size_label?: string; product?: { name?: string } };
}

export function OrderItemsList({ items, className }: { items: OrderItemLike[]; className?: string }) {
  return (
    <ul className={`divide-y divide-border border-y border-border ${className ?? ""}`}>
      {items.map((item) => (
        <li key={item.id} className="flex justify-between py-3 text-sm">
          <span>
            {item.variant?.product?.name} ({item.variant?.size_label}) × {item.quantity}
          </span>
          <span>{formatNaira(item.unit_price * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}
