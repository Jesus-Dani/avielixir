"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm({
  customerId,
  initialName,
  initialPhone,
  initialAddress,
}: {
  customerId: string;
  initialName: string;
  initialPhone: string;
  initialAddress: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const supabase = createClient();
    await supabase.from("customer").update({ name, phone, saved_address: address }).eq("id", customerId);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label htmlFor="name" className="eyebrow block text-ink-soft">Full Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="phone" className="eyebrow block text-ink-soft">Phone</label>
        <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="address" className="eyebrow block text-ink-soft">Saved Address</label>
        <textarea id="address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={status === "saving"} className="rounded-full bg-mauve-deep px-6 py-2 text-sm text-white hover:bg-mauve-deep-2 disabled:opacity-60">
        {status === "saved" ? "Saved ✓" : status === "saving" ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
