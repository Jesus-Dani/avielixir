import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to leave a review." }, { status: 401 });
  }

  const body = await request.json();
  const { product_id, rating, comment } = body as { product_id?: string; rating?: number; comment?: string };

  if (!product_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "A product and a 1-5 rating are required." }, { status: 400 });
  }

  // Guest orders aren't visible under RLS, so eligibility (which may match by
  // guest_email) is checked with the service-role client, read-only.
  const admin = createAdminClient();
  const { data: eligibleOrders, error: eligibilityError } = await admin
    .from("order")
    .select("id, order_item!inner(product_variant_id, product_variant!inner(product_id))")
    .eq("status", "paid")
    .eq("order_item.product_variant.product_id", product_id)
    .or(`customer_id.eq.${user.id},guest_email.eq.${user.email}`);

  if (eligibilityError) {
    return NextResponse.json({ error: "Could not verify purchase history." }, { status: 500 });
  }

  if (!eligibleOrders || eligibleOrders.length === 0) {
    return NextResponse.json(
      { error: "Only customers with a completed purchase of this product can leave a review." },
      { status: 403 }
    );
  }

  const { error: insertError } = await supabase.from("review").insert({
    product_id,
    customer_id: user.id,
    rating,
    comment: comment || null,
    status: "pending",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
