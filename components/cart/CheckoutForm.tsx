"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

export function CheckoutForm({
  isLoggedIn,
  initialEmail,
  initialName,
  initialPhone,
  initialAddress,
}: {
  isLoggedIn: boolean;
  initialEmail: string;
  initialName: string;
  initialPhone: string;
  initialAddress: string;
}) {
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard SSR/CSR hydration guard for localStorage-backed cart state
    setMounted(true);
  }, []);

  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  if (!mounted) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        phone,
        address,
        deliveryPhoneNote: phone,
        lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    window.location.href = body.authorizationUrl;
  }

  return (
    <form onSubmit={submit} className="grid gap-10 md:grid-cols-2">
      <div className="space-y-5">
        <h2 className="font-display text-xl text-ink">Contact & Delivery</h2>
        {!isLoggedIn && (
          <p className="text-sm text-ink-soft">
            Checking out as a guest. <a href="/login" className="text-mauve-deep underline">Sign in</a> to save your details for next time.
          </p>
        )}
        <div>
          <label htmlFor="email" className="eyebrow block text-ink-soft">Email</label>
          <input
            id="email"
            type="email"
            required
            disabled={isLoggedIn}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm disabled:bg-bg-soft"
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

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={status === "submitting" || lines.length === 0}
          className="mt-6 w-full rounded-full bg-mauve-deep px-8 py-3 text-sm font-medium text-white hover:bg-mauve-deep-2 disabled:opacity-60"
        >
          {status === "submitting" ? "Redirecting to payment..." : "Pay with Paystack"}
        </button>
      </div>
    </form>
  );
}
