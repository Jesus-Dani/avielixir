"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function WishlistButton({ variantId }: { variantId: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("wishlist")
      .select("id")
      .eq("customer_id", userId)
      .eq("product_variant_id", variantId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [userId, variantId, supabase]);

  async function toggle() {
    if (!userId) {
      router.push("/login");
      return;
    }
    setPending(true);
    if (saved) {
      await supabase.from("wishlist").delete().eq("customer_id", userId).eq("product_variant_id", variantId);
      setSaved(false);
    } else {
      await supabase.from("wishlist").insert({ customer_id: userId, product_variant_id: variantId });
      setSaved(true);
    }
    setPending(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={pending || userId === undefined}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className="flex items-center gap-2 text-sm text-ink-soft hover:text-mauve-deep disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
        <path
          d="M12 21s-7.5-4.6-10-9.2C.5 8.4 2.2 5 5.6 5c2 0 3.3 1 4.4 2.4C11.1 6 12.4 5 14.4 5c3.4 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z"
          strokeLinejoin="round"
        />
      </svg>
      {saved ? "Saved" : "Save to wishlist"}
    </button>
  );
}
