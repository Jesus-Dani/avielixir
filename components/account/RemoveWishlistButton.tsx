"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RemoveWishlistButton({ wishlistId }: { wishlistId: string }) {
  const router = useRouter();

  async function remove() {
    const supabase = createClient();
    await supabase.from("wishlist").delete().eq("id", wishlistId);
    router.refresh();
  }

  return (
    <button onClick={remove} className="text-xs text-ink-soft underline hover:text-red-600">
      Remove
    </button>
  );
}
