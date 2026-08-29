import { createAdminClient } from "@/lib/supabase/admin";
import { moderateReview } from "@/lib/admin-actions";
import { SubmitButton } from "@/components/admin/SubmitButton";

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data: reviews } = await supabase
    .from("review")
    .select("*, product:product_id(name), customer:customer_id(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Review Moderation</h1>

      {!reviews || reviews.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No reviews awaiting moderation.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-md border border-border p-5">
              <p className="font-medium text-ink">{r.product?.name}</p>
              <p className="text-sm text-ink-soft">By {r.customer?.name ?? "Customer"} ({r.rating}★)</p>
              {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
              <div className="mt-3 flex gap-3">
                <form action={moderateReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="approved" />
                  <SubmitButton pendingText="Approving..." className="rounded-full bg-mauve-deep px-4 py-1.5 text-xs text-white">
                    Approve
                  </SubmitButton>
                </form>
                <form action={moderateReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <SubmitButton pendingText="Rejecting..." className="rounded-full border border-border px-4 py-1.5 text-xs text-ink-soft">
                    Reject
                  </SubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
