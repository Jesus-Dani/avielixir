import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/resend";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "")
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data.reference as string;
    const admin = createAdminClient();

    const { error } = await admin.rpc("complete_order_payment", {
      p_order_id: reference,
      p_reference: reference,
    });

    if (error) {
      console.error("complete_order_payment failed", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: order } = await admin.from("order").select("*").eq("id", reference).single();
    const { data: items } = await admin
      .from("order_item")
      .select("*, variant:product_variant_id(*, product:product_id(name, slug))")
      .eq("order_id", reference);

    if (order) {
      let email = order.guest_email ?? undefined;
      if (!email && order.customer_id) {
        const { data: authUser } = await admin.auth.admin.getUserById(order.customer_id);
        email = authUser?.user?.email;
      }
      if (email) {
        await sendOrderConfirmationEmail(order, items ?? [], email).catch((err) =>
          console.error("order confirmation email failed", err)
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
