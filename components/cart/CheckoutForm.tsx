"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { getBankDetails } from "@/lib/bank-details";
import { useMounted } from "@/lib/use-mounted";
import { ImageUploadTile } from "@/components/ui/ImageUploadTile";

export function CheckoutForm({
  userId,
  email,
  initialName,
  initialPhone,
  initialAddress,
}: {
  userId: string;
  email: string;
  initialName: string;
  initialPhone: string;
  initialAddress: string;
}) {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const mounted = useMounted();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  const bank = getBankDetails();

  if (!mounted) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!receipt) {
      setError("Please upload a screenshot of your transfer receipt.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError("");

    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${receipt.name}`;
    const { error: uploadError } = await supabase.storage.from("order-receipts").upload(path, receipt);

    if (uploadError) {
      setError("Could not upload your receipt. Please try again.");
      setStatus("error");
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        phone,
        address,
        receiptPath: path,
        lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    router.push(`/checkout/confirmation/${body.orderId}`);
  }

  return (
    <form onSubmit={submit} className="grid gap-10 md:grid-cols-2">
      <div className="space-y-5">
        <h2 className="font-display text-xl text-ink">Contact & Delivery</h2>
        <div>
          <label htmlFor="email" className="eyebrow block text-ink-soft">Email</label>
          <input
            id="email"
            type="email"
            disabled
            value={email}
            className="mt-2 w-full rounded-md border border-border bg-bg-soft px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="name" className="eyebrow block text-ink-soft">Full Name</label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="phone" className="eyebrow block text-ink-soft">Phone Number</label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-ink-soft">We&rsquo;ll contact you here to arrange delivery and confirm the delivery fee.</p>
        </div>
        <div>
          <label htmlFor="address" className="eyebrow block text-ink-soft">Delivery Address</label>
          <textarea
            id="address"
            required
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-ink">Order Summary</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {lines.map((line) => (
            <li key={line.variantId} className="flex justify-between py-3 text-sm">
              <span>{line.productName} ({line.sizeLabel}) × {line.quantity}</span>
              <span>{formatNaira(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between font-medium text-ink">
          <span>Subtotal</span>
          <span>{formatNaira(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          This total is for products only. Avi Elixir will contact you separately to arrange your delivery fee.
        </p>

        <div className="mt-6 rounded-md bg-bg-soft p-4">
          <p className="eyebrow text-mauve">Pay by Bank Transfer</p>
          <dl className="mt-2 space-y-1 text-sm text-ink">
            <div className="flex justify-between"><dt className="text-ink-soft">Bank</dt><dd>{bank.bankName}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Account Number</dt><dd className="font-medium">{bank.accountNumber}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Account Name</dt><dd>{bank.accountName}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Amount</dt><dd className="font-medium">{formatNaira(subtotal)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-ink-soft">
            Transfer the amount above, then upload a screenshot of your receipt below to complete your order.
          </p>
        </div>

        <div className="mt-4">
          <p className="eyebrow block text-ink-soft">Payment Receipt</p>
          <div className="mt-2">
            <ImageUploadTile onFilesChange={(files) => setReceipt(files[0] ?? null)} />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={status === "submitting" || lines.length === 0}
          className="mt-6 w-full rounded-full bg-mauve-deep px-8 py-3 text-sm font-medium text-white hover:bg-mauve-deep-2 disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting Order..." : "Submit Order"}
        </button>
      </div>
    </form>
  );
}
