import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/product/ReviewForm";
import type { Review } from "@/lib/types";

export async function ReviewsSection({ productId }: { productId: string }) {
  const supabase = await createClient();

  const [{ data: reviews }, { data: userData }] = await Promise.all([
    supabase
      .from("review")
      .select("*, customer:customer_id(name)")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const approved = (reviews ?? []) as unknown as Review[];
  const isLoggedIn = !!userData.user;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="font-display text-2xl text-ink">Reviews</h2>

      {approved.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {approved.map((review) => (
            <li key={review.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" className="text-gold">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="1" />
                  </svg>
                ))}
                <span className="text-sm font-medium text-ink">{review.customer?.name ?? "Avi Elixir customer"}</span>
              </div>
              {review.comment && <p className="mt-2 text-sm text-ink-soft">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      {isLoggedIn ? (
        <ReviewForm productId={productId} />
      ) : (
        <p className="mt-6 text-sm text-ink-soft">
          <Link href="/login" className="text-mauve-deep underline">Sign in</Link> with a verified purchase to leave a review.
        </p>
      )}
    </section>
  );
}
