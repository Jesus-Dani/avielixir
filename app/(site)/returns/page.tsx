import { PageHeader } from "@/components/layout/PageHeader";

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <PageHeader eyebrow="Policy" title="Returns Policy" />
      <div className="mt-8 space-y-5 text-ink-soft">
        <p>All sales on Avi Elixir are final. We do not accept returns, exchanges, or refunds once an order has been placed and paid for.</p>
        <p>
          Because fragrances are a personal, hygiene-sensitive product, this policy protects both our customers
          and the integrity of every bottle we sell. Please review your selection carefully, including scent notes
          and size options, before completing your purchase.
        </p>
        <p>
          If your order arrives damaged or incorrect, message us on WhatsApp with your order number and we&rsquo;ll
          make it right.
        </p>
      </div>
    </div>
  );
}
